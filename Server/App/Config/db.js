import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const DB_URI = process.env.DBURI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI).then((db) => {
      console.log("MongoDB connected to:", db.connection.host);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
