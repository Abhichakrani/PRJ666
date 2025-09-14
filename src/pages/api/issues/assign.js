import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";
import mongoose from "mongoose";
import { sendIssueAssignmentEmail } from "@/utils/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectToDatabase();
    const decoded = verifyToken(req);

    // Only allow admin role to assign issues
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { issueId, clerkId } = req.body;

    if (!issueId || !clerkId) {
      return res.status(400).json({ message: "issueId and clerkId are required" });
    }

    const issueObjectId = new mongoose.Types.ObjectId(issueId);
    const issue = await Issue.findById(issueObjectId);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.assignedClerk = clerkId;
    await issue.save();

    // ✅ Create a notification for the assigned clerk
    await Notification.create({
      userId: clerkId,
      message: `You have been assigned to issue: ${issue.title}`,
      type: "Assignment",
      read: false,
      createdAt: new Date()
    });

    // Send email notification to the assigned clerk
    try {
      const clerk = await User.findById(clerkId);
      if (clerk && clerk.email) {
        await sendIssueAssignmentEmail(
          clerk.email,
          clerk.name,
          issue.title
        );
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails
    }

    return res.status(200).json({ message: "Issue assigned to clerk successfully" });
  } catch (err) {
    console.error("Error assigning issue:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
