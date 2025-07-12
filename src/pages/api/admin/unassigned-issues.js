import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectToDatabase();
    const decoded = verifyToken(req);

    // Only allow admin role to access this endpoint
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all unassigned issues
    const unassignedIssues = await Issue.find({ 
      assignedClerk: { $exists: false } 
    }).populate('userId', 'name email').sort({ createdAt: -1 });

    // Get all clerks for assignment
    const clerks = await User.find({ role: "clerk" }, 'name email');

    return res.status(200).json({ 
      issues: unassignedIssues,
      clerks: clerks
    });
  } catch (err) {
    console.error("Error fetching unassigned issues:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
} 