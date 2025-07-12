import { connectToDatabase } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/middleware/auth";
import User from '@/models/User';
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

    // Get all issues with populated user and clerk information
    const issues = await Issue.find({})
      .populate('userId', 'name email')
      .populate('assignedClerk', 'name email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: issues.length,
      unassigned: issues.filter(issue => !issue.assignedClerk).length,
      assigned: issues.filter(issue => issue.assignedClerk).length,
      pendingApproval: issues.filter(issue => issue.status === 'Pending Approval').length,
      underReview: issues.filter(issue => issue.status === 'Under Review').length,
      resolved: issues.filter(issue => issue.status === 'Resolved').length,
      rejected: issues.filter(issue => issue.status === 'Rejected').length
    };

    return res.status(200).json({ 
      issues,
      stats
    });
  } catch (err) {
    console.error("Error fetching all issues:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
} 