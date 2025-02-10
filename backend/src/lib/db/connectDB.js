import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const URI = process.env.MONGODB_URL;
    if (!URI) {
      throw new Error("Database connection failed : URI not found");
    }
    const conn = await mongoose.connect(URI);
    if (!conn) {
      throw new Error("Database connection failed");
    }
    console.log("Database connected", conn.connection.host);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
