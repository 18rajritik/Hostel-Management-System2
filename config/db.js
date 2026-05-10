const mongoose = require("mongoose");

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI).then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      cachedConnection = conn;
      return conn;
    });
  }

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

module.exports = connectDB;
