import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";
import mongoose from "mongoose";
import { sendIssueEscalationEmail } from "@/utils/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed!" });
  }

  await connectToDatabase();

  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only clerks and admins can escalate issues
    if (decoded.role !== "clerk" && decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.query;
    const { priority, reason } = req.body;

    if (!priority || !["Low", "Medium", "High", "Critical"].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority level" });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: "Escalation reason is required (minimum 10 characters)" });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if user has permission to escalate this issue
    if (decoded.role === "clerk" && issue.assignedClerk?.toString() !== decoded.id) {
      return res.status(403).json({ message: "You can only escalate issues assigned to you" });
    }

    // Update issue priority
    issue.priority = priority;
    
    // Add escalation update
    if (!Array.isArray(issue.updates)) {
      issue.updates = [];
    }
    
    issue.updates.push({
      text: `Issue escalated to ${priority} priority. Reason: ${reason}`,
      status: issue.status,
      timestamp: new Date()
    });

    await issue.save();

    // Create notifications for relevant parties
    const notifications = [];

    // Notify the resident who reported the issue
    notifications.push({
      userId: issue.userId,
      message: `Your issue "${issue.title}" has been escalated to ${priority} priority.`,
      type: "Escalation",
      read: false,
      createdAt: new Date()
    });

    // If escalated by clerk, notify admin
    if (decoded.role === "clerk") {
      // Find admin users
      const admins = await User.find({ role: "admin" });
      
      admins.forEach(admin => {
        notifications.push({
          userId: admin._id,
          message: `Issue "${issue.title}" has been escalated to ${priority} priority by clerk.`,
          type: "Escalation",
          read: false,
          createdAt: new Date()
        });
      });
    }

    // Save all notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Send email notifications
    try {
      // Send email to resident
      const resident = await User.findById(issue.userId);
      if (resident && resident.email) {
        await sendIssueEscalationEmail(
          resident.email,
          resident.name,
          issue.title,
          priority,
          reason
        );
      }

      // If escalated by clerk, send email to admins
      if (decoded.role === "clerk") {
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          if (admin.email) {
            await sendIssueEscalationEmail(
              admin.email,
              admin.name,
              issue.title,
              priority,
              reason
            );
          }
        }
      }
    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
      // Don't fail the request if email fails
    }

    return res.status(200).json({ 
      message: "Issue escalated successfully",
      issue: {
        id: issue._id,
        title: issue.title,
        priority: issue.priority,
        status: issue.status
      }
    });

  } catch (error) {
    console.error("Escalation error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 