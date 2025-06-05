import { verifyToken } from "../../middleware/auth";

export default function handler(req, res) {
  try {
    const user = verifyToken(req); // validate token
    res.status(200).json({
      message: "✅ This is protected content.",
      user, // show decoded user data
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}
