import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token found" });
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error("JWT secret key not found");
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default protectRoute;
