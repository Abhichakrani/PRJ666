import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    await connectToDatabase();
    const decoded = verifyToken(req);

    if (decoded.role !== "clerk") {
      return res.status(403).json({ message: "Access denied" });
    }

    const issues = await Issue.find({ assignedClerk: decoded.id }).sort({ createdAt: -1 });

    return res.status(200).json({ issues });
  } catch (err) {
    console.error("Error fetching assigned issues:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
