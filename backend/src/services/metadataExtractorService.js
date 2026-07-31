/**
 * metadataExtractorService.js — Extracts structured GeM/tender metadata fields
 * from the plain text of a scanned document.
 *
 * Strategy:
 *  1. Label → next-non-empty-line pattern for GeM key-value pairs
 *  2. Section heading → paragraph content for long-form fields (SOW, Summary, etc.)
 *  3. Regex patterns for emails, websites, amounts, dates
 */

/**
 * Extract the value that appears immediately after a given label line.
 * Takes the first non-empty line following the label.
 *
 * @param {string} text   Full extracted document text
 * @param {string[]} labels  Label variants to search for
 * @returns {string}
 */
function extractField(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match the label then grab the next non-blank line
    const pattern = new RegExp(
      "^[ \\t]*" + escaped + "[ \\t]*:?[ \\t]*$\\s*([^\\n]+)",
      "im"
    );
    const match = text.match(pattern);
    if (match && match[1].trim() && match[1].trim().length > 1) {
      return match[1].trim();
    }
    // Also try inline: "Label: Value" format
    const inline = new RegExp(escaped + "\\s*[:\\-]\\s*([^\\n]+)", "i");
    const inlineMatch = text.match(inline);
    if (inlineMatch && inlineMatch[1].trim().length > 1) {
      return inlineMatch[1].trim();
    }
  }
  return "Not Found";
}

/**
 * Extract a multi-line section body that follows a heading.
 * Grabs up to 3 sentences / ~300 characters from the section.
 *
 * @param {string} text
 * @param {string[]} headings
 * @returns {string}
 */
function extractSection(text, headings) {
  for (const heading of headings) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match the heading line and grab everything until the next numbered heading
    const pattern = new RegExp(
      escaped + "[\\s\\S]{0,10}\\n([\\s\\S]{20,600}?)(?=\\n\\d+\\.|\\n[A-Z]{3,}|$)",
      "i"
    );
    const match = text.match(pattern);
    if (match && match[1].trim().length > 10) {
      // Return first 300 chars, trimmed cleanly
      const body = match[1].replace(/\n+/g, " ").trim();
      return body.substring(0, 300) + (body.length > 300 ? "..." : "");
    }
  }
  return "Not Found";
}

/**
 * Extract all structured metadata fields from a document's plain text.
 *
 * @param {string} text       Full extracted document text
 * @param {string} fileName   Original file name
 * @returns {Object}
 */
function extractMetadata(text, fileName) {
  // ── Auto-detect email addresses in text ────────────────────────────────────
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const emailValue = emailMatch ? emailMatch[0] : "Not Found";

  // ── Auto-detect website URLs in text ───────────────────────────────────────
  const urlMatch = text.match(/(?:www\.|https?:\/\/)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/\S*)?/);
  const websiteValue = urlMatch ? urlMatch[0] : "Not Found";

  // ── Auto-detect corrigendum / addendum mentions ─────────────────────────────
  const corrigendumMatch = text.match(
    /(?:Addendum|Corrigendum|Amendment|Erratum)\s*\d*[^\n]*/i
  );
  const corrigendumValue = corrigendumMatch ? corrigendumMatch[0].trim() : "Not Found";

  // ── Scope of work: take first 300 chars of the SOW section ─────────────────
  const sowValue = extractSection(text, [
    "Scope of Work",
    "Comprehensive Scope of Work",
    "Scope",
    "SOW",
  ]);

  // ── Summary: derive from item category + organisation if no explicit field ──
  const category  = extractField(text, ["Item Category", "Category", "Tab Name"]);
  const org       = extractField(text, ["Organisation Name", "Organization Name", "Purchaser"]);
  const location  = extractField(text, ["Office Name", "Location", "Place"]);
  const summaryValue = category !== "Not Found" && org !== "Not Found"
    ? `${category} — ${org}, ${location}`
    : extractSection(text, ["Summary", "Abstract", "Tender Summary", "Purpose"]);

  // ── Description: extract from section headings ──────────────────────────────
  const descValue = extractSection(text, [
    "Scope of Work",
    "Project Description",
    "Tender Description",
    "Description",
    "Subject",
    "Comprehensive Scope",
  ]);

  // ── Technical qualification ─────────────────────────────────────────────────
  const techQual = extractField(text, [
    "Document Required from Seller",
    "Technical Qualification",
    "Technical Criteria",
    "Eligibility Criteria",
    "Vendor Eligibility",
    "Experience Criteria",
  ]);

  // ── Financial qualification ─────────────────────────────────────────────────
  // Often embedded in the Vendor Eligibility paragraph — extract sentence mentioning turnover
  const finQualMatch = text.match(
    /(?:minimum annual|annual financial|turnover)[^\n.]{10,150}/i
  );
  const finQualValue = finQualMatch
    ? finQualMatch[0].trim()
    : extractField(text, ["Financial Qualification", "Financial Criteria", "Turnover Criteria"]);

  return {
    tenderId: extractField(text, [
      "Bid Number",
      "Bid No.",
      "Bid No",
      "Tender ID",
      "Tender No",
      "Reference No",
      "GeM Bid Number",
    ]),

    tenderNo: extractField(text, [
      "Tender No",
      "Tender Number",
      "NIT No",
      "NIT Number",
      "Bid No.",
      "Bid Number",
    ]),

    authority: extractField(text, [
      "Organisation Name",
      "Organization Name",
      "Purchaser",
      "Procuring Entity",
      "Authority",
      "Tender Authority",
      "Issued By",
      "Department Name",
    ]),

    location: extractField(text, [
      "Office Name",
      "Location",
      "Place",
      "Delivery Location",
      "Work Location",
    ]),

    openingDate: extractField(text, [
      "Bid Opening Date/Time",
      "Opening Date",
      "Tender Opening Date",
      "Technical Bid Opening",
    ]),

    closingDate: extractField(text, [
      "Bid End Date/Time",
      "Closing Date",
      "Last Date",
      "Submission Deadline",
      "Bid Closing Date",
    ]),

    tenderAmount: extractField(text, [
      "Estimated Value",
      "Estimated Cost",
      "Tender Amount",
      "Contract Value",
      "Budget",
    ]),

    emd: extractField(text, [
      "EMD Detail",
      "EMD Amount",
      "Earnest Money Deposit",
      "EMD",
    ]),

    documentCost: extractField(text, [
      "Document Cost",
      "Tender Fee",
      "Document Fee",
    ]),

    tenderFee: extractField(text, [
      "Tender Fee",
      "Processing Fee",
      "Bid Fee",
      "Document Cost",
    ]),

    tabName: extractField(text, [
      "Item Category",
      "Category",
      "Tab Name",
      "Work Category",
      "Product Category",
    ]),

    technicalQual:     techQual,
    financialQual:     finQualValue,
    scopeOfWork:       sowValue,
    tenderSummary:     summaryValue,
    tenderDescription: descValue,
    corrigendum:       corrigendumValue,

    purchaserAddress: extractField(text, [
      "Purchaser Address",
      "Address",
      "Contact Address",
      "Office Address",
    ]),

    email:   emailValue,
    website: websiteValue,
  };
}

module.exports = { extractMetadata };
