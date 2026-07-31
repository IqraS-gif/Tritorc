/**
 * db.js — MongoDB connection setup with graceful error handling.
 *
 * Connects using MONGODB_URI environment variable or defaults to
 * mongodb://127.0.0.1:27017/tritorc_scanner.
 *
 * If connection fails (e.g. MongoDB service isn't running locally),
 * it logs a warning and allows the backend to function without DB storage.
 */

const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tritorc_scanner";

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // 3 seconds timeout
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB (${err.message}). Scanner will run in memory-only mode.`);
  }
}

function getDBStatus() {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tritorc_scanner",
  };
}

module.exports = { connectDB, getDBStatus };
