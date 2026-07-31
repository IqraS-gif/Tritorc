/**
 * reportService.js — Excel report generation for Tritorc Relevance Checker.
 *
 * Exports:
 *   - generateExcelReport()         Standard 4-column summary report
 *   - generateDetailedExcelReport() Detailed 24-column report matching sample layout
 */

const ExcelJS = require("exceljs");

/** Relevance → fill colour mapping */
const RELEVANCE_COLOURS = {
  "High Relevance": "FF2E7D32", // Dark green
  Possible:         "FFF57F17", // Amber
  "No Relevance":   "FFC62828", // Dark red
};

/** Helper: style a header cell */
function styleHeader(cell, bgArgb = "FF1A237E") {
  cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  cell.border = { bottom: { style: "medium", color: { argb: "FF283593" } } };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 1 — Standard summary (4 columns)
// ─────────────────────────────────────────────────────────────────────────────
async function generateExcelReport(results) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tritorc Relevance Checker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Scan Results", {
    pageSetup: { fitToPage: true, orientation: "landscape" },
  });

  sheet.columns = [
    { header: "Document Name",    key: "fileName",        width: 40 },
    { header: "Matched Keywords", key: "matchedKeywords", width: 60 },
    { header: "Match Count",      key: "matchCount",      width: 15 },
    { header: "Relevance",        key: "relevance",       width: 20 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => styleHeader(cell));
  headerRow.height = 30;

  results.forEach((result, idx) => {
    const row = sheet.addRow({
      fileName: result.fileName,
      matchedKeywords: result.matchedKeywords.length > 0 ? result.matchedKeywords.join(", ") : "None",
      matchCount: result.matchCount,
      relevance: result.relevance,
    });

    const rowBg = idx % 2 === 0 ? "FFF5F5F5" : "FFFFFFFF";
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: "middle", horizontal: colNumber === 3 ? "center" : "left", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
    });

    const relevanceCell = row.getCell("relevance");
    const colour = RELEVANCE_COLOURS[result.relevance] || "FF9E9E9E";
    relevanceCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colour } };
    relevanceCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    relevanceCell.alignment = { horizontal: "center", vertical: "middle" };
    row.height = 25;
  });

  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 4 } };

  return workbook.xlsx.writeBuffer();
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 2 — Detailed 24-column report (mirrors sample_tender_scan_report.xlsx)
// ─────────────────────────────────────────────────────────────────────────────
async function generateDetailedExcelReport(results) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tritorc Relevance Checker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Tender Scan Report", {
    pageSetup: { fitToPage: true, orientation: "landscape" },
  });

  sheet.columns = [
    { header: "Document Name",           key: "fileName",              width: 38 },
    { header: "Tender ID",               key: "tenderId",              width: 20 },
    { header: "Tender No",               key: "tenderNo",              width: 22 },
    { header: "Tender Authority",        key: "authority",             width: 30 },
    { header: "Location",                key: "location",              width: 24 },
    { header: "Opening Date",            key: "openingDate",           width: 16 },
    { header: "Closing Date",            key: "closingDate",           width: 16 },
    { header: "Tender Amount",           key: "tenderAmount",          width: 22 },
    { header: "EMD",                     key: "emd",                   width: 20 },
    { header: "Document Cost",           key: "documentCost",          width: 16 },
    { header: "Tender Fee",              key: "tenderFee",             width: 16 },
    { header: "Tab Name",                key: "tabName",               width: 20 },
    { header: "Technical Qualification", key: "technicalQual",         width: 40 },
    { header: "Financial Qualification", key: "financialQual",         width: 40 },
    { header: "Scope of Work",           key: "scopeOfWork",           width: 50 },
    { header: "Tender Summary",          key: "tenderSummary",         width: 55 },
    { header: "Tender Description",      key: "tenderDescription",     width: 55 },
    { header: "Corrigendum",             key: "corrigendum",           width: 25 },
    { header: "Purchaser Address",       key: "purchaserAddress",      width: 35 },
    { header: "Email",                   key: "email",                 width: 30 },
    { header: "Website",                 key: "website",               width: 28 },
    { header: "Matched Keywords",        key: "matchedKeywords",       width: 50 },
    { header: "Match Count",             key: "matchCount",            width: 14 },
    { header: "Relevance to Tritorc",   key: "relevance",             width: 20 },
  ];

  // Style header row with dark crimson (brand colour)
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => styleHeader(cell, "FF7F1D1D"));
  headerRow.height = 32;

  results.forEach((result, idx) => {
    // Map relevance to the label used in the sample report
    const relevanceLabel =
      result.relevance === "High Relevance" ? "Related" :
      result.relevance === "Possible"       ? "Possible" :
      result.relevance === "No Relevance"   ? "Not Related" :
      "Error";

    const row = sheet.addRow({
      fileName:           result.fileName,
      tenderId:           result.tenderId        || "Not Found",
      tenderNo:           result.tenderNo        || "Not Found",
      authority:          result.authority       || "Not Found",
      location:           result.location        || "Not Found",
      openingDate:        result.openingDate     || "Not Found",
      closingDate:        result.closingDate     || "Not Found",
      tenderAmount:       result.tenderAmount    || "Not Found",
      emd:                result.emd             || "Not Found",
      documentCost:       result.documentCost    || "Not Found",
      tenderFee:          result.tenderFee       || "Not Found",
      tabName:            result.tabName         || "Not Found",
      technicalQual:      result.technicalQual   || "Not Found",
      financialQual:      result.financialQual   || "Not Found",
      scopeOfWork:        result.scopeOfWork     || "Not Found",
      tenderSummary:      result.tenderSummary   || "Not Found",
      tenderDescription:  result.tenderDescription || "Not Found",
      corrigendum:        result.corrigendum     || "Not Found",
      purchaserAddress:   result.purchaserAddress || "Not Found",
      email:              result.email           || "Not Found",
      website:            result.website         || "Not Found",
      matchedKeywords:    result.matchedKeywords.length > 0 ? result.matchedKeywords.join(", ") : "(none found)",
      matchCount:         result.matchCount,
      relevance:          relevanceLabel,
    });

    const rowBg = idx % 2 === 0 ? "FFFFF8F8" : "FFFFFFFF";
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 23 ? "center" : "left",
        wrapText: true,
      };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
    });

    // Colour-code Relevance cell
    const relCell = row.getCell("relevance");
    const relArgb =
      relevanceLabel === "Related"     ? "FF2E7D32" :
      relevanceLabel === "Possible"    ? "FFF57F17" :
      relevanceLabel === "Not Related" ? "FFC62828" :
      "FF9E9E9E";
    relCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: relArgb } };
    relCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    relCell.alignment = { horizontal: "center", vertical: "middle" };

    // Bold the match count cell
    const mcCell = row.getCell("matchCount");
    mcCell.font = { bold: true };
    mcCell.alignment = { horizontal: "center", vertical: "middle" };

    row.height = 55; // Taller rows for wrapped text
  });

  // Footer note
  sheet.addRow([]);
  const noteRow = sheet.addRow(["",
    "Fields marked \"Not Found\" indicate the field was not present in the source document. "
    + "Scan powered by Tritorc Relevance Checker — Porter Stemmer + Regex matching."
  ]);
  noteRow.getCell(2).font = { italic: true, color: { argb: "FF64748B" }, size: 9 };

  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 24 } };

  return workbook.xlsx.writeBuffer();
}

module.exports = { generateExcelReport, generateDetailedExcelReport };
