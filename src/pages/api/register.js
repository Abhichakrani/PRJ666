import { connectToDatabase } from "../../lib/mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed." });
  }

const { name, email, password, role } = req.body;

if (!name || !email || !password) {
  return res.status(400).json({ error: "Name, email, and password are required" });
}

// Strong password pattern
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=])[A-Za-z\d@$!%*?&#^()_+=]{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    error: "Password must be at least 8 characters and include one uppercase letter, one number, and one special character.",
  });
}


  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "resident",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
