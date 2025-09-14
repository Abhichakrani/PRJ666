import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectToDatabase();
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "GET") {
      // Fetch notifications for the logged-in user sorted by newest first
      const notifications = await Notification.find({ userId: decoded.id }).sort({ createdAt: -1 });
      return res.status(200).json({ notifications });
    }

    if (req.method === "POST") {
      // Mark all unread notifications for the user as read
      await Notification.updateMany({ userId: decoded.id, read: false }, { $set: { read: true } });
      return res.status(200).json({ message: "Notifications marked as read" });
    }
  } catch (err) {
    console.error("Error in notifications API:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
