import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";
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

    const issue = await Issue.findById(issueObjectId);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.assignedClerk = clerkId;
    await issue.save();

    return res.status(200).json({ message: "Issue assigned to clerk successfully" });
  } catch (err) {
    console.error("Error assigning issue:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
