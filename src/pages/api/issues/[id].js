import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";
import mongoose from "mongoose";
import Notification from "@/models/Notification";
import { sendIssueStatusUpdateEmail } from "@/utils/mailer";

export default async function handler(req, res) {
  const { method } = req;
  const {
    query: { id },
  } = req;

  await connectToDatabase();

  if (!["GET", "PUT"].includes(method)) {
    return res.status(405).json({ message: `Method ${method} Not Allowed!` });
  }

  try {
    const decoded = verifyToken(req);
    const objectId = new mongoose.Types.ObjectId(id);

    if (method === "GET") {
      // For GET requests, clerks can view their assigned issues, residents can view their own issues
      const query = decoded.role === "clerk" 
        ? { _id: objectId, assignedClerk: decoded.id }
        : { _id: objectId, userId: decoded.id };

      const issue = await Issue.findOne(query);

      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      // Normalize updates: convert string updates to objects
      const normalizedUpdates = (issue.updates || []).map((update) => {
        if (typeof update === "string") {
          return {
            text: update,
            status: issue.status || "Pending Approval",
            timestamp: issue.updatedAt || new Date(),
          };
        }
        return update;
      });

      return res.status(200).json({
        issue: {
          id: issue._id,
          title: issue.title,
          category: issue.category,
          description: issue.description,
          status: issue.status,
          createdAt: issue.createdAt,
          location: issue.location,
          latitude: issue.latitude,
          longitude: issue.longitude,
          images: issue.images || [],
          updates: normalizedUpdates,
          feedbacks: issue.feedbacks || [],
        },
      });
    }

    // Handle PUT requests (update status)
    if (method === "PUT") {
      if (decoded.role !== "clerk") {
        return res.status(403).json({ message: "Only clerks can update issue status" });
      }

      const { status, updateText: rawUpdateText } = req.body;

      if (!status || !rawUpdateText) {
        return res.status(400).json({ message: "Status and update text are required" });
      }

      const issue = await Issue.findOne({ _id: objectId, assignedClerk: decoded.id });

      if (!issue) {
        return res.status(404).json({ message: "Issue not found or not assigned to you" });
      }

      try {
        const trimmedUpdateText = rawUpdateText.trim();
        if (!trimmedUpdateText) {
          return res.status(400).json({ message: "Update text cannot be empty" });
        }

        // Update status
        issue.status = status;

        // Ensure updates is an array
        if (!Array.isArray(issue.updates)) {
          issue.updates = [];
        }

        // ✅ Push update with status and timestamp
        issue.updates.push({
          text: trimmedUpdateText,
          status: status,
          timestamp: new Date()
        });

        await issue.save();

        // Notify the resident who reported the issue
        await Notification.create({
          userId: issue.userId, // resident's ID
          message: `Your issue "${issue.title}" was updated to "${status}".`,
          type: "Update",
          read: false,
          createdAt: new Date()
        });

        // Send email notification to the resident
        try {
          const resident = await User.findById(issue.userId);
          if (resident && resident.email) {
            await sendIssueStatusUpdateEmail(
              resident.email,
              resident.name,
              issue.title,
              status,
              trimmedUpdateText
            );
          }
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
          // Don't fail the request if email fails
        }

        return res.status(200).json({
          message: "Issue updated successfully",
          issue: {
            id: issue._id,
            title: issue.title,
            category: issue.category,
            description: issue.description,
            status: issue.status,
            createdAt: issue.createdAt,
            location: issue.location,
            latitude: issue.latitude,
            longitude: issue.longitude,
            images: issue.images || [],
            updates: issue.updates || [],
            feedbacks: issue.feedbacks || [],
          },
        });
      } catch (error) {
        console.error("Error updating issue:", error);
        return res.status(500).json({ message: "Failed to update issue" });
      }
    }

  } catch (err) {
    console.error("Error in request:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
