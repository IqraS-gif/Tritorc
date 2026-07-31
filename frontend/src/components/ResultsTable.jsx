/**
 * ResultsTable.jsx — Displays per-document scan results in a responsive table.
 *
 * Props:
 *   - results: ScanResult[]
 */

import React, { useState } from "react";

/** Relevance badge component */
function RelevanceBadge({ relevance }) {
  const map = {
    "High Relevance": { cls: "badge-yes",      dot: "#16a34a", label: "High Relevance" },
    Possible:         { cls: "badge-possible", dot: "#d97706", label: "Possible"       },
    "No Relevance":   { cls: "badge-no",       dot: "#dc2626", label: "No Relevance"   },
    Error:            { cls: "badge-error",    dot: "#dc2626", label: "Error"          },
  };
  const cfg = map[relevance] || map.Error;

  return (
    <span className={`relevance-badge ${cfg.cls}`}>
      <span
        style={{
          width:        "6px",
          height:       "6px",
          borderRadius: "50%",
          background:   cfg.dot,
          flexShrink:   0,
          display:      "inline-block",
        }}
      />
      {cfg.label}
    </span>
  );
}

/** Expandable row detail showing matched keywords as chips */
function KeywordsCell({ keywords, error }) {
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <span style={{ color: "var(--clr-danger)", fontSize: "0.82rem", fontWeight: 500 }}>
        [Error] {error}
      </span>
    );
  }

  if (keywords.length === 0) {
    return (
      <span style={{ color: "var(--clr-text-muted)", fontSize: "0.82rem", fontStyle: "italic" }}>
        No matches
      </span>
    );
  }

  const PREVIEW_COUNT = 3;
  const showAll       = expanded || keywords.length <= PREVIEW_COUNT;
  const visible       = showAll ? keywords : keywords.slice(0, PREVIEW_COUNT);
  const remaining     = keywords.length - PREVIEW_COUNT;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
      {visible.map((kw) => (
        <span key={kw} className="keyword-chip">{kw}</span>
      ))}

      {!showAll && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background:   "#fee2e2",
            border:       "1px solid #fca5a5",
            borderRadius: "var(--radius-sm)",
            padding:      "2px 8px",
            fontSize:     "0.72rem",
            fontWeight:   600,
            color:        "#991b1b",
            cursor:       "pointer",
            transition:   "all 0.15s",
          }}
        >
          +{remaining} more
        </button>
      )}

      {showAll && keywords.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded(false)}
          style={{
            background:   "none",
            border:       "none",
            fontSize:     "0.72rem",
            color:        "var(--clr-text-muted)",
            cursor:       "pointer",
            textDecoration: "underline",
          }}
        >
          Show less
        </button>
      )}
    </div>
  );
}

export function ResultsTable({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{
          width:        "4px",
          height:       "20px",
          background:   "var(--clr-primary)",
          borderRadius: "var(--radius-full)",
        }} />
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--clr-text-primary)", margin: 0 }}>
          Detailed Results
        </h2>
        <span style={{
          marginLeft:   "auto",
          fontSize:     "0.78rem",
          fontWeight:   600,
          color:        "var(--clr-text-secondary)",
          background:   "#f1f5f9",
          border:       "1px solid var(--clr-border)",
          borderRadius: "var(--radius-md)",
          padding:      "2px 10px",
        }}>
          {results.length} document{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table wrapper — horizontal scroll on small screens */}
      <div className="results-table-wrapper">

        <table
          role="table"
          aria-label="Document scan results"
          style={{
            width:           "100%",
            borderCollapse:  "collapse",
            tableLayout:     "fixed",
          }}
        >
          {/* Column widths */}
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "40%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>

          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--clr-border)" }}>
              {["Document Name", "Matched Keywords", "Matches", "Relevance"].map((header) => (
                <th
                  key={header}
                  className={header === "Matched Keywords" ? "col-keywords" : undefined}
                  style={{
                    padding:       "12px 16px",
                    textAlign:     header === "Matches" ? "center" : "left",
                    fontSize:      "0.78rem",
                    fontWeight:    700,
                    color:         "var(--clr-text-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace:    "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>


          <tbody>
            {results.map((result, idx) => (
              <tr
                key={`${result.fileName}-${idx}`}
                style={{
                  background:  idx % 2 === 0
                    ? "#ffffff"
                    : "#f8fafc",
                  transition:  "background 0.15s",
                  borderBottom: "1px solid var(--clr-border)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0
                  ? "#ffffff"
                  : "#f8fafc"
                )}
              >
                {/* Document Name */}
                <td
                  style={{
                    padding:      "14px 16px",
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={result.fileName.toLowerCase().endsWith(".pdf") ? "#dc2626" : "#2563eb"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span
                      style={{
                        fontSize:     "0.88rem",
                        fontWeight:   600,
                        color:        "var(--clr-text-primary)",
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        wordBreak:    "break-word",
                        lineHeight:   1.4,
                      }}
                    >
                      {result.fileName}
                    </span>
                  </div>
                </td>

                {/* Matched Keywords */}
                <td
                  className="col-keywords"
                  style={{ padding: "14px 16px", verticalAlign: "top" }}
                >
                  <KeywordsCell keywords={result.matchedKeywords} error={result.error} />
                </td>


                {/* Match Count */}
                <td
                  style={{
                    padding:      "14px 16px",
                    textAlign:    "center",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      fontSize:   "1.1rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color:      result.matchCount > 0
                        ? "var(--clr-primary)"
                        : "var(--clr-text-muted)",
                    }}
                  >
                    {result.matchCount}
                  </span>
                </td>

                {/* Relevance */}
                <td
                  style={{
                    padding:      "14px 16px",
                    verticalAlign: "middle",
                  }}
                >
                  <RelevanceBadge relevance={result.relevance} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
