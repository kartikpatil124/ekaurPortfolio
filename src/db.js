const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = async () => {
  try {
    // Use MONGODB_URI from environment variable, fallback to localhost for development
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio_db";

    console.log("Connecting to MongoDB...");
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't exit in production, let the server continue
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
