import generateToken from "../lib/utils/generateToken.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

// User Signup
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password length check
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    // Generate token
    await generateToken(user._id, res);

    // Return user data (excluding password)
    res
      .status(201)
      .json({ _id: user._id, fullName: user.fullName, email: user.email });
  } catch (err) {
    console.error("Error in signup controller:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "None",
    });

    res.status(200).json({ status: "success", message: "Logout successful" });
  } catch (err) {
    console.error("Error in logout controller:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?.id; // Ensure middleware sets req.user

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePic = profilePic;
    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error in updateProfile controller:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check Authentication
export const checkAuth = (req, res) => {
  try {
    console.log("User from middleware:", req.user); // Debug log
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    res.status(200).json(req.user);
  } catch (err) {
    console.error("Error in checkAuth controller:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
