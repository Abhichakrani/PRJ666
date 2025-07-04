import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";
import mongoose from "mongoose";

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

          // Update the issue status
          issue.status = status;

          // Ensure updates array exists
          if (!Array.isArray(issue.updates)) {
            issue.updates = [];
          }

          // Add the new update as a string
          issue.updates.push(trimmedUpdateText);

          // Save changes
          await issue.save();

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
