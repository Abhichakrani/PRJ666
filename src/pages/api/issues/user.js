import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/middleware/auth";
import Issue from "@/models/Issue";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed!" });
  }

  try {

    await connectToDatabase();

    const decoded = verifyToken(req);
    const userId = decoded.id;
    console.log("Authorization Header:", req.headers.authorization);

    const issues = await Issue.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ issues });
  } catch (err) {
    console.error("Failed to fetch user issues:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
