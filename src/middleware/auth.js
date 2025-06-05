import jwt from "jsonwebtoken";

export function verifyToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // contains { id, email, role }
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
