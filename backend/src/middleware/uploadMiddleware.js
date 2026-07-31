/**
 * uploadMiddleware.js — Multer configuration for file uploads.
 *
 * - Stores files in memory (no disk writes) to keep the server stateless.
 * - Accepts only .pdf and .docx files (validated by MIME type and extension).
 * - Limits individual file size to 20 MB and allows up to 20 files per request.
 */

const multer = require("multer");
const path = require("path");

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTS = new Set([".pdf", ".docx"]);

/** Multer memory storage — files available as req.files[n].buffer */
const storage = multer.memoryStorage();

/** File filter — rejects unsupported types before they reach the controller */
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) || ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${file.originalname}". Only PDF and DOCX files are accepted.`
      ),
      false
    );
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB per file
    files: 20,                  // Max 20 files per request
  },
});

module.exports = { upload };
