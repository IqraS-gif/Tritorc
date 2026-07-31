/**
 * ScanSummary.jsx — Visual summary cards showing scan result statistics.
 *
 * Props:
 *   - summary: { total, relevant, possible, notRelevant, errors }
 */

import React from "react";

function StatCard({ label, value, colour, bgColour, borderColour, description }) {
  return (
    <div
      style={{
        flex:           1,
        minWidth:       "140px",
        padding:        "18px",
        background:     bgColour,
        border:         `1px solid ${borderColour}`,
        borderRadius:   "var(--radius-md)",
        textAlign:      "center",
        animation:      "fadeIn 0.3s ease",
        transition:     "transform 0.15s ease, border-color 0.15s ease",
        cursor:         "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform  = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = "translateY(0)";
      }}
    >
      <div
        style={{
          fontSize:   "1.8rem",
          fontWeight: 800,
          color:      colour,
          lineHeight: 1,
          fontFamily: "var(--font-mono)",
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize:  "0.78rem",
          color:     "var(--clr-text-primary)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      {description && (
        <div style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)", marginTop: "4px" }}>
          {description}
        </div>
      )}
    </div>
  );
}

export function ScanSummary({ summary }) {
  if (!summary || summary.total === 0) return null;

  const relevanceRate =
    summary.total > 0
      ? Math.round((summary.relevant / summary.total) * 100)
      : 0;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Section header */}
      <div
        style={{
          display:       "flex",
          alignItems:    "center",
          gap:           "10px",
          marginBottom:  "16px",
        }}
      >
        <div
          style={{
            width:        "4px",
            height:       "20px",
            background:   "var(--clr-primary)",
            borderRadius: "var(--radius-full)",
          }}
        />
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--clr-text-primary)", margin: 0 }}>
          Scan Summary
        </h2>
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <StatCard
          label="Total Scanned"
          value={summary.total}
          colour="#0f172a"
          bgColour="#ffffff"
          borderColour="#cbd5e1"
          description="documents processed"
        />
        <StatCard
          label="High Relevance"
          value={summary.relevant}
          colour="#15803d"
          bgColour="#f0fdf4"
          borderColour="#bbf7d0"
          description={`${relevanceRate}% hit rate`}
        />
        <StatCard
          label="Possible"
          value={summary.possible}
          colour="#b45309"
          bgColour="#fffbeb"
          borderColour="#fde68a"
          description="1-2 matches"
        />
        <StatCard
          label="No Relevance"
          value={summary.notRelevant}
          colour="#b91c1c"
          bgColour="#fef2f2"
          borderColour="#fca5a5"
          description="0 matches found"
        />
        {summary.errors > 0 && (
          <StatCard
            label="Errors"
            value={summary.errors}
            colour="#c2410c"
            bgColour="#fff7ed"
            borderColour="#ffedd5"
            description="extraction failed"
          />
        )}
      </div>
    </div>
  );
}
