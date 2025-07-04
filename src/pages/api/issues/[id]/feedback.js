// /pages/api/issues/[id]/feedback.js
import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed!" });
  }

  await connectToDatabase();

  try {
    const user = verifyToken(req);
    const { id } = req.query;
    const { rating, comment, anonymous } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const issue = await Issue.findById(id);
    if (!issue || issue.userId.toString() !== user.id) {
      return res.status(404).json({ message: "Issue not found or unauthorized" });
    }

    issue.feedbacks.push({ rating, comment, anonymous });
    await issue.save();

    return res.status(200).json({ message: "Feedback submitted successfully, Thank You!" });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
