import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    res.status(200).json({ message: "✅ Connected to MongoDB" });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    res.status(500).json({ error: "Failed to connect to database" });
  }
}
