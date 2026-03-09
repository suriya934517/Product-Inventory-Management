import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized - Missing or invalid Authorization header" });
  }

  try {
    const token = authHeader.split(" ")[1];
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server error - JWT_SECRET not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token format or signature" });
    }
    res.status(401).json({ message: "Authentication failed: " + error.message });
  }
};
