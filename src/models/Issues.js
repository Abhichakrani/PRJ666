// models/Issues.js
import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  category: { type: String, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  residentId: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Issue || mongoose.model("Issue", issueSchema);
