import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateToken = async (userId, res) => {
  try {
    console.log("Generating token for userId:", userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return res.status(400).json({ message: "Invalid user id" });
    }

    const secret = process.env.JWT_SECRET_KEY;
    console.log("JWT_SECRET_KEY:", secret); // ✅ Debugging

    if (!secret) {
      console.error("JWT_SECRET_KEY is missing");
      return res.status(500).json({ message: "JWT secret key not found" });
    }

    const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
    console.log("Generated token:", token);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    return token;
  } catch (err) {
    console.error("Error in generateToken controller:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default generateToken;
