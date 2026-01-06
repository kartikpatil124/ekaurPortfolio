const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Use MONGODB_URI from environment variable, fallback to localhost for development
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio_db";

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
