/**
 * reportService.js — Excel report generation for Tritorc Relevance Checker.
 *
 * Generates an .xlsx workbook with one row per scanned document using ExcelJS.
 * Columns: Document Name | Matched Keywords | Match Count | Relevance
 *
 * The workbook is built in-memory and returned as a Buffer for streaming
 * to the client without touching the disk.
 */

const ExcelJS = require("exceljs");

/**
 * Relevance → fill colour mapping for visual clarity in the report.
 */
const RELEVANCE_COLOURS = {
  Yes: "FF2E7D32",       // Dark green
  Possible: "FFF57F17", // Amber
  No: "FFC62828",        // Dark red
};

/**
 * Generate an Excel workbook buffer from scan results.
 *
 * @param {Array<{
 *   fileName: string,
 *   matchedKeywords: string[],
 *   matchCount: number,
 *   relevance: string
 * }>} results - Array of per-document scan results
 *
 * @returns {Promise<Buffer>} Excel file as a Buffer
 */
async function generateExcelReport(results) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tritorc Relevance Checker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Scan Results", {
    pageSetup: { fitToPage: true, orientation: "landscape" },
  });

  // ── Column definitions ────────────────────────────────────────────────────
  sheet.columns = [
    { header: "Document Name",    key: "fileName",        width: 40 },
    { header: "Matched Keywords", key: "matchedKeywords", width: 60 },
    { header: "Match Count",      key: "matchCount",      width: 15 },
    { header: "Relevance",        key: "relevance",       width: 15 },
  ];

  // ── Style the header row ─────────────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A237E" }, // Deep navy
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF283593" } },
    };
  });
  headerRow.height = 30;

  // ── Add data rows ────────────────────────────────────────────────────────
  results.forEach((result, idx) => {
    const row = sheet.addRow({
      fileName: result.fileName,
      matchedKeywords:
        result.matchedKeywords.length > 0
          ? result.matchedKeywords.join(", ")
          : "None",
      matchCount: result.matchCount,
      relevance: result.relevance,
    });

    // Alternate row background
    const rowBg = idx % 2 === 0 ? "FFF5F5F5" : "FFFFFFFF";

    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 3 ? "center" : "left",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowBg },
      };
    });

    // Colour-code the Relevance cell
    const relevanceCell = row.getCell("relevance");
    const colour = RELEVANCE_COLOURS[result.relevance] || "FF9E9E9E";
    relevanceCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colour },
    };
    relevanceCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    relevanceCell.alignment = { horizontal: "center", vertical: "middle" };

    row.height = 25;
  });

  // ── Freeze the header row ────────────────────────────────────────────────
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // ── Add auto-filter ──────────────────────────────────────────────────────
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: 4 },
  };

  // ── Return as Buffer ─────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcelReport };
