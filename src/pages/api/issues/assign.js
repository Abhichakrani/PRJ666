import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";
import { transporter } from "@/utils/mailer";
import mongoose from "mongoose";

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
    const clerkObjectId = new mongoose.Types.ObjectId(clerkId);

    // Get issue and clerk details
    const issue = await Issue.findById(issueObjectId).populate('userId', 'name email');
    const clerk = await User.findById(clerkObjectId);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (!clerk) {
      return res.status(404).json({ message: "Clerk not found" });
    }

    // Assign the issue to the clerk
    issue.assignedClerk = clerkId;
    issue.status = "Under Review"; // Update status when assigned
    await issue.save();

    // Send notification email to the clerk
    try {
      await transporter.sendMail({
        from: '"Community Service App" <noreply@communityapp.ca>',
        to: clerk.email,
        subject: "New Issue Assigned to You",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B00;">New Issue Assignment</h2>
            <p>Hello ${clerk.name},</p>
            <p>A new issue has been assigned to you:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${issue.title}</h3>
              <p><strong>Category:</strong> ${issue.category}</p>
              <p><strong>Location:</strong> ${issue.location}</p>
              <p><strong>Description:</strong> ${issue.description}</p>
              <p><strong>Reported by:</strong> ${issue.userId?.name || 'Unknown'}</p>
              <p><strong>Reported on:</strong> ${new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
            <p>Please log into your dashboard to review and start working on this issue.</p>
            <p>Best regards,<br>Community Service Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
      // Don't fail the assignment if email fails
    }

    return res.status(200).json({ 
      message: "Issue assigned to clerk successfully",
      notificationSent: true
    });
  } catch (err) {
    console.error("Error assigning issue:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
