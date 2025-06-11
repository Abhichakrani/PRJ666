import mongoose from "mongoose";
import { connectToDatabase } from "../../../lib/mongodb";
import Issue from "../../../models/Issues";
import User from "../../../models/User";


export default async function handler(req, res) {
  await connectToDatabase();

 if (req.method === 'GET') {
  try {
    const { clerkId } = req.query;

    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    // Validate clerkId format (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(clerkId)) {
      return res.status(400).json({ error: "Invalid clerkId format" });
    }

    // Find issues assigned to this clerk
    const issues = await Issue.find({ 
      clerkId: clerkId,
      status: { $ne: "Resolved" }
    });

    if (!issues || issues.length === 0) {
      return res.status(404).json({ error: "No issues found for the specified clerkId" });
    }

    return res.status(200).json(issues);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


  
 if (req.method === "PATCH") {
  try {
    const { issueId, clerkId } = req.body;

    if (!issueId || !clerkId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate clerkId format
    if (!mongoose.Types.ObjectId.isValid(clerkId)) {
      return res.status(400).json({ error: "Invalid clerkId format" });
    }

    // ✅ Check if the user with clerkId exists and has role "clerk"
    const clerkUser = await User.findById(clerkId);
    if (!clerkUser || clerkUser.role !== "clerk") {
      return res.status(400).json({ error: "Provided ID is not a valid clerk" });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      {
        clerkId,
        status: "Acknowledged",
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`Issue ${issueId} acknowledged by clerk ${clerkId}`);
    console.log(`Resident ${updatedIssue.residentId} should be notified about ${updatedIssue.category}`);

    return res.status(200).json({
      success: true,
      data: updatedIssue,
      message: "Issue acknowledged successfully"
    });
  } catch (error) {
    console.error("Error acknowledging issue:", error.message);
    return res.status(500).json({
      error: "Failed to acknowledge issue",
      details: error.message
    });
  }
}

  return res.status(405).json({ error: "Method not allowed" });
}