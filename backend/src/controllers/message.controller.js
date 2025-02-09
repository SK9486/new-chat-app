import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import cloudinary from "../lib/utils/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket/sokect.js";
import { io } from "../lib/socket/sokect.js";
export const getUsers = async (req, res) => {
  try {
    const id = req.user?.id; // Assuming authentication middleware sets req.user

    if (!id) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const users = await User.find({ _id: { $ne: id } }).select("-password");

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error in getUsers controller:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { user } = req; // Authenticated user
    const { id: userId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    // Fetch messages between the authenticated user and the target user
    const messages = await Message.find({
      $or: [
        { senderId: user._id, receiverId: userId },
        { senderId: userId, receiverId: user._id },
      ],
    }).sort({ createdAt: 1 }); // Sort messages in ascending order (oldest first) // Convert Mongoose documents to plain JavaScript objects for better performance

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error in getMessages controller:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const myId = req.user._id.toString(); // Convert to string for safety
    const { text, image } = req.body;
    const { id: userId } = req.params;
    console.log("myId", myId);
    console.log("Request Params:", req.params);
    console.log("userId", userId);

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Either text or image is required" });
    }

    let imageUrl = "";
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId: userId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
