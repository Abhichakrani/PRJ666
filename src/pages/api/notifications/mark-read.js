import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectToDatabase();
    const decoded = verifyToken(req);
    const userId = decoded.id;

    await Notification.updateMany({ userId: userId, read: false }, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
}
