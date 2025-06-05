import { connectToDatabase } from "../../lib/mongodb";
import User from "../../models/User";
import crypto from "crypto";
import { sendResetEmail } from "../../utils/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 900000; // 15 min
  await user.save();

  await sendResetEmail(email, token);

  res.status(200).json({ message: "Reset email sent!" });
}
