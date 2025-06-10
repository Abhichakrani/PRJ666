import { connectToDatabase } from "../../../lib/mongodb";
import Issue from "../../../models/Issues";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "PATCH") {
    try {
      const { issueId, clerkId } = req.body;

      if (!issueId || !clerkId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updatedIssue = await Issue.findByIdAndUpdate(
        issueId,
        { 
          status: "Acknowledged",
          clerkId,
          updatedAt: new Date() 
        },
        { new: true }
      );

      // Simple console log instead of notification
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