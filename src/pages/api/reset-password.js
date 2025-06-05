import { connectToDatabase } from "../../lib/mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password required." });
  }

  // ✅ Password strength validation
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=])[A-Za-z\d@$!%*?&#^()_+=]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include one uppercase letter, one number, and one special character.",
    });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset." });
  } catch (error) {
    console.error("❌ Reset password error: ", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
