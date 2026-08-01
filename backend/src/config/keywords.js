/**
 * keywords.js — Central keyword configuration for Tritorc Relevance Checker.
 *
 * Each entry contains:
 *   - label   : Human-readable display name for the keyword
 *   - patterns: Array of RegExp objects that match the keyword and its variants.
 *               All patterns use word-boundary anchors (\b) to prevent false positives.
 *               Patterns are case-insensitive (applied at match time).
 *
 * To add a new keyword: append an object with `label` and one or more `patterns`.
 * To add a variant: append a new RegExp to the relevant keyword's `patterns` array.
 */

const KEYWORDS = [
  {
    label: "Hydraulic torque wrench",
    patterns: [
      /\bhydraulic\s+torque\s+wrench(es|ing|ed)?\b/,
    ],
  },
  {
    label: "Bolt tensioner",
    patterns: [
      /\bbolt\s+tension(er|ers|ing|ed|s)?\b/,
    ],
  },
  {
    label: "Hydraulic bolt tensioning",
    patterns: [
      /\bhydraulic\s+bolt\s+tension(ing|ed|er|ers|s)?\b/,
    ],
  },
  {
    label: "Controlled bolting",
    patterns: [
      /\bcontrolled\s+bolt(ing|ed|s)?\b/,
    ],
  },
  {
    label: "Flange management",
    patterns: [
      /\bflange\s+management\b/,
      /\bflange\s+manag(ing|ement|er|ers)?\b/,
    ],
  },
  {
    label: "Flange joint integrity",
    patterns: [
      /\bflange\s+joint\s+integrity\b/,
      /\bflange\s+joint\s+(integrit(y|ies)|assurance)\b/,
    ],
  },
  {
    label: "Torque wrench",
    patterns: [
      /\btorque\s+wrench(es|ing|ed)?\b/,
    ],
  },
  {
    label: "Stud bolt tensioning",
    patterns: [
      /\bstud\s+bolt\s+tension(ing|ed|er|ers|s)?\b/,
    ],
  },
  {
    label: "Nut splitter",
    patterns: [
      /\bnut\s+splitt(er|ers|ing|ed)?\b/,
    ],
  },
  {
    label: "Torque multiplier",
    patterns: [
      /\btorque\s+multipli(er|ers|cation|ed)?\b/,
    ],
  },
  {
    label: "Bolting tools",
    patterns: [
      /\bbolting\s+tool(s|ing|ed)?\b/,
      /\bbolting\s+equipment\b/,
    ],
  },
  {
    label: "Flange bolt tightening",
    patterns: [
      /\bflange\s+bolt\s+tighten(ing|ed|er|ers)?\b/,
    ],
  },
  {
    label: "Turnaround services",
    patterns: [
      /\bturnaround\s+service(s|ing|d)?\b/,
      /\bturn-around\s+service(s)?\b/,
    ],
  },
  {
    label: "Shutdown maintenance",
    patterns: [
      /\bshutdown\s+mainten(ance|ing|ed)?\b/,
      /\bshut-down\s+mainten(ance|ing|ed)?\b/,
    ],
  },
  {
    label: "Plant shutdown",
    patterns: [
      /\bplant\s+shut(-?down|s)?\b/,
    ],
  },
  {
    label: "Bolted joint",
    patterns: [
      /\bbolted\s+joint(s|ing|ed)?\b/,
    ],
  },
  {
    label: "Pre-tensioning",
    patterns: [
      /\bpre[-\s]?tension(ing|ed|er|ers|s)?\b/,
    ],
  },
  {
    label: "Gasket and flange management",
    patterns: [
      /\bgasket\s+and\s+flange\s+management\b/,
      /\bgasket\s+&\s+flange\s+management\b/,
    ],
  },
  {
    label: "Torque calibration",
    patterns: [
      /\btorque\s+calibrat(ion|ing|ed|or|ors)?\b/,
    ],
  },
  {
    label: "Mechanical bolting",
    patterns: [
      /\bmechanical\s+bolt(ing|ed|s)?\b/,
    ],
  },
];

/**
 * Compute the relevance label from match count.
 * Thresholds:
 *   0 matches        → "No Relevance"
 *   1-2 matches      → "Possible"
 *   3+ matches       → "High Relevance"
 *
 * @param {number} count - Number of unique matched keywords
 * @returns {"High Relevance"|"Possible"|"No Relevance"}
 */
function computeRelevance(count) {
  if (count >= 3) return "High Relevance";
  if (count >= 1) return "Possible";
  return "No Relevance";
}

module.exports = { KEYWORDS, computeRelevance };
