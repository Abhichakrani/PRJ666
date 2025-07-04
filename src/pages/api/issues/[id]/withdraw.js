// /pages/api/issues/[id]/withdraw.js
import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed!" });
  }

  await connectToDatabase();

  try {
    const user = verifyToken(req);
    const { id } = req.query;

    const issue = await Issue.findById(id);
    if (!issue || issue.userId.toString() !== user.id) {
      return res.status(404).json({ message: "Issue not found or unauthorized" });
    }

    await Issue.findByIdAndDelete(id);

    return res.status(200).json({ message: "Complaint withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
