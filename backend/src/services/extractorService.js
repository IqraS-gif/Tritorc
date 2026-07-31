/**
 * extractorService.js — Handles text extraction from PDF and DOCX files.
 *
 * Uses:
 *   - pdf-parse  : for .pdf files (reads raw Buffer from multer memoryStorage)
 *   - mammoth    : for .docx files (reads raw Buffer from multer memoryStorage)
 *
 * Returns plain UTF-8 text string for downstream keyword matching.
 */

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extract text from a PDF buffer.
 * @param {Buffer} buffer - Raw PDF file buffer
 * @returns {Promise<{ text: string, html: string|null }>} Extracted text and html
 */
async function extractFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return { text: data.text || "", html: null };
  } catch (err) {
    throw new Error(`PDF extraction failed: ${err.message}`);
  }
}

/**
 * Extract text and HTML from a DOCX buffer.
 * @param {Buffer} buffer - Raw DOCX file buffer
 * @returns {Promise<{ text: string, html: string }>} Extracted plain text and HTML
 */
async function extractFromDOCX(buffer) {
  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    const htmlResult = await mammoth.convertToHtml({ buffer });
    return { text: rawResult.value || "", html: htmlResult.value || "" };
  } catch (err) {
    throw new Error(`DOCX extraction failed: ${err.message}`);
  }
}

/**
 * Route extraction to the correct handler based on MIME type or file extension.
 *
 * @param {Buffer} buffer       - File buffer
 * @param {string} mimetype     - MIME type from multer
 * @param {string} originalname - Original filename
 * @returns {Promise<{ text: string, html: string|null }>} Extracted text and html
 */
async function extractText(buffer, mimetype, originalname) {
  const ext = originalname.split(".").pop().toLowerCase();

  if (
    mimetype === "application/pdf" ||
    ext === "pdf"
  ) {
    return extractFromPDF(buffer);
  }

  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    return extractFromDOCX(buffer);
  }

  throw new Error(
    `Unsupported file type: ${originalname}. Only PDF and DOCX are supported.`
  );
}

module.exports = { extractText };
