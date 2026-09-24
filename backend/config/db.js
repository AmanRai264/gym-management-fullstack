require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

// Serverless functions are frozen and reused between requests, so the
// connection is cached on the Node.js global object. Without this, every
// invocation would open a new pool and exhaust MongoDB Atlas' connection limit.
const globalCache = globalThis;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!globalCache.__mongooseConnectionPromise) {
    globalCache.__mongooseConnectionPromise = mongoose
      .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gym_management_demo", {
        serverSelectionTimeoutMS: 5000,
        // Fail with a clear error instead of silently buffering queries while
        // the connection is not ready.
        bufferCommands: false,
      })
      .then((conn) => {
        console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((error) => {
        // Clear the cache so a later invocation can retry the connection.
        globalCache.__mongooseConnectionPromise = null;
        console.error("[DB] MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return globalCache.__mongooseConnectionPromise;
};

module.exports = connectDB;
