/**
 * app.js — Express application entry point for Tritorc Relevance Checker backend.
 *
 * Responsibilities:
 *   - Load environment variables
 *   - Configure CORS for frontend dev server + production origin
 *   - Mount API routes
 *   - Global error handling middleware
 *   - Start HTTP server
 */

require("dotenv").config();

const express       = require("express");
const cors          = require("cors");
const scanRoutes    = require("./routes/scanRoutes");
const historyRoutes = require("./routes/historyRoutes");
const { connectDB } = require("./db");


const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173", // Vite dev server
  "http://localhost:3000",                              // Optional CRA fallback
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
      }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
// Note: JSON body parsing for /api/report is applied at the route level
// to allow multer to handle multipart for /api/scan without conflicts.
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Tritorc Relevance Checker API",
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api", scanRoutes);
app.use("/api", historyRoutes);


// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Catches errors passed via next(err), including multer errors
app.use((err, _req, res, _next) => {
  console.error("[GlobalErrorHandler]", err.message);

  // Multer-specific errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large. Maximum allowed size is 20 MB per file.",
    });
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many files. Maximum 20 files per request.",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Tritorc Relevance Checker API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Scan:   POST http://localhost:${PORT}/api/scan`);
  console.log(`   Report: POST http://localhost:${PORT}/api/report\n`);

  // Connect to MongoDB
  await connectDB();
});


module.exports = app; // Exported for testing
