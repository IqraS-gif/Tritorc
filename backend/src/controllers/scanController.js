/**
 * scanController.js — Request handlers for document scanning and report download.
 *
 * POST /api/scan
 *   Accepts multipart/form-data with one or more files.
 *   Returns JSON array of scan results.
 *
 * POST /api/report
 *   Accepts JSON body { results: [...] }.
 *   Returns an .xlsx file as a binary stream.
 */

const { extractText }        = require("../services/extractorService");
const { scanText }           = require("../services/matcherService");
const { generateExcelReport } = require("../services/reportService");

/**
 * POST /api/scan
 * Process uploaded files and return keyword scan results.
 */
async function scanDocuments(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Please upload at least one PDF or DOCX file.",
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        // 1. Extract plain text from the uploaded buffer
        const text = await extractText(
          file.buffer,
          file.mimetype,
          file.originalname
        );

        // 2. Scan the extracted text against the keyword config
        const { matchedKeywords, matchCount, relevance } = scanText(text);

        results.push({
          fileName: file.originalname,
          matchedKeywords,
          matchCount,
          relevance,
          error: null,
        });
      } catch (fileErr) {
        // Don't abort the entire batch — record per-file errors and continue
        results.push({
          fileName: file.originalname,
          matchedKeywords: [],
          matchCount: 0,
          relevance: "Error",
          error: fileErr.message,
        });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("[scanDocuments] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during document scanning.",
    });
  }
}

/**
 * POST /api/report
 * Generate and stream an Excel report from previously computed scan results.
 */
async function downloadReport(req, res) {
  try {
    const { results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No scan results provided. Please scan documents first.",
      });
    }

    const excelBuffer = await generateExcelReport(results);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `Tritorc_Scan_Report_${timestamp}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", excelBuffer.length);

    return res.status(200).send(excelBuffer);
  } catch (err) {
    console.error("[downloadReport] Error generating Excel report:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Excel report.",
    });
  }
}

module.exports = { scanDocuments, downloadReport };
