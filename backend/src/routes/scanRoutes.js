/**
 * scanRoutes.js — Express router for document scanning API endpoints.
 */

const express    = require("express");
const router     = express.Router();
const { upload } = require("../middleware/uploadMiddleware");
const { scanDocuments, downloadReport } = require("../controllers/scanController");

/**
 * POST /api/scan
 * Multipart upload of PDF/DOCX files → returns JSON scan results
 */
router.post("/scan", upload.array("files", 20), scanDocuments);

/**
 * POST /api/report
 * Accepts { results: [...] } JSON → streams .xlsx file
 */
router.post("/report", express.json({ limit: "5mb" }), downloadReport);

module.exports = router;
