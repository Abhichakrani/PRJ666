// pages/api/issues.js
import { connectToDatabase } from "../../lib/mongodb";
import Issue from "../../models/Issues";  

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await connectToDatabase();

      const { category, image, location, residentId } = req.body;

      if (!category || !image || !location || !residentId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const issue = await Issue.create({
        category,
        image,
        location,
        residentId,
        status: "Pending",
        createdAt: new Date(),
      });

      res.status(201).json(issue);
    } catch (error) {
      console.error("❌ Issue creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}