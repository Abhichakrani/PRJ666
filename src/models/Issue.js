import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending Approval", "Under Review", "Resolved", "Rejected"],
      default: "Pending Approval",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedClerk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updates: {
      type: Array,
      default: []
    },

    feedbacks: [
      {
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        anonymous: { type: Boolean, default: true },
        submissionDate: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model("Issue", issueSchema);
