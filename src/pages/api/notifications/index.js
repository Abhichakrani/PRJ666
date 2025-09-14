import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    await connectToDatabase();

    const decoded = verifyToken(req);
    console.log("Decoded Token:", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid or missing token" });
    }

    const userId = decoded.id;

    const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 });
    const hasUnread = notifications.some(n => !n.read);

    return res.status(200).json({ notifications, hasUnread });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
