/**
 * matcherService.js — Keyword matching engine for Tritorc Relevance Checker.
 *
 * Strategy:
 *   1. Normalise the document text (lowercase, collapse whitespace).
 *   2. For each keyword in the config, test all its regex patterns against
 *      the normalised text using word-boundary anchors (already embedded in
 *      the pattern definitions in keywords.js).
 *   3. A keyword is "matched" if ANY of its patterns fires.
 *   4. Collect unique matched keyword labels and compute the relevance score.
 *
 * Fuzzy / stemming approach (lightweight, deterministic):
 *   - All patterns in keywords.js already handle common morphological
 *     variants via regex alternations (e.g. tension(ing|ed|er|ers|s)?).
 *   - Additionally, we use the Porter Stemmer from the `natural` package to
 *     create a stemmed index of the document text. Single-word keywords that
 *     fail the regex test are re-checked against the stemmed index for robustness.
 *   - Multi-word phrases rely purely on the regex patterns (stemming is not
 *     applied to multi-word phrases to avoid false positives).
 */

const natural = require("natural");
const { KEYWORDS, computeRelevance } = require("../config/keywords");

const stemmer = natural.PorterStemmer;

/**
 * Build a Set of stemmed tokens from the document text.
 * Used for single-word keyword fallback matching.
 *
 * @param {string} text - Raw document text (already lowercase)
 * @returns {Set<string>} Set of stemmed word tokens
 */
function buildStemmedIndex(text) {
  // Tokenise on word characters only; ignore punctuation
  const tokens = text.match(/\b[a-z]+\b/g) || [];
  return new Set(tokens.map((t) => stemmer.stem(t)));
}

/**
 * Check if a keyword label is a single word (no spaces, no hyphens with spaces).
 * Only single-word keywords benefit from stemming fallback.
 *
 * @param {string} label - Keyword label
 * @returns {boolean}
 */
function isSingleWordKeyword(label) {
  return !/\s/.test(label.trim());
}

/**
 * Scan a document's text against the keyword configuration.
 *
 * @param {string} rawText - Extracted document text
 * @returns {{ matchedKeywords: string[], matchCount: number, relevance: string }}
 */
function scanText(rawText) {
  // Normalise: lowercase + collapse multiple whitespace
  const normalised = rawText.toLowerCase().replace(/\s+/g, " ");

  // Build stemmed index for single-word fallback
  const stemmedIndex = buildStemmedIndex(normalised);

  const matchedLabels = new Set();

  for (const keyword of KEYWORDS) {
    let matched = false;

    // 1. Try all regex patterns (case-insensitive flag applied here)
    for (const pattern of keyword.patterns) {
      const caseInsensitivePattern = new RegExp(pattern.source, "i");
      if (caseInsensitivePattern.test(normalised)) {
        matched = true;
        break;
      }
    }

    // 2. Stemming fallback for single-word keywords only
    if (!matched && isSingleWordKeyword(keyword.label)) {
      const stemmedKeyword = stemmer.stem(keyword.label.toLowerCase());
      if (stemmedIndex.has(stemmedKeyword)) {
        matched = true;
      }
    }

    if (matched) {
      matchedLabels.add(keyword.label);
    }
  }

  const matchedKeywords = Array.from(matchedLabels);
  const matchCount = matchedKeywords.length;
  const relevance = computeRelevance(matchCount);

  return { matchedKeywords, matchCount, relevance };
}

module.exports = { scanText };
