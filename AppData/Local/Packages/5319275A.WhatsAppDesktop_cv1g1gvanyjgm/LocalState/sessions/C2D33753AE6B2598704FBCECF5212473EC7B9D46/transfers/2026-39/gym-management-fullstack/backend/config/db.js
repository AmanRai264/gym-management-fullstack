require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gym_management_demo", {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("[DB] MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
