import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["resident", "clerk", "admin"], default: "resident" },
    address: {
      type: String, // Only relevant for residents
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "French"],
      default: "English",
    },
    notifications: [
      {
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    //  Password reset
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
