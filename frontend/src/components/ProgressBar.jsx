/**
 * ProgressBar.jsx — Animated upload/scan progress indicator.
 *
 * Props:
 *   - progress (number) : 0–100
 *   - status   (string) : "uploading" | "scanning" | "done" | "error"
 */

import React from "react";

const STATUS_LABELS = {
  uploading: "Uploading documents…",
  scanning:  "Scanning for keywords…",
  done:      "Scan complete!",
  error:     "An error occurred.",
};

const STATUS_COLOURS = {
  uploading: "var(--clr-primary)",
  scanning:  "var(--clr-accent)",
  done:      "var(--clr-success)",
  error:     "var(--clr-danger)",
};

export function ProgressBar({ progress, status }) {
  const colour = STATUS_COLOURS[status] || STATUS_COLOURS.uploading;
  const label  = STATUS_LABELS[status]  || "";
  const pct    = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        width:         "100%",
        animation:     "fadeIn 0.3s ease",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   "8px",
        }}
      >
        <span
          style={{
            fontSize:   "0.85rem",
            fontWeight: 500,
            color:      colour,
            display:    "flex",
            alignItems: "center",
            gap:        "8px",
          }}
        >
          {/* Spinner for active states */}
          {(status === "uploading" || status === "scanning") && (
            <span
              style={{
                width:      "14px",
                height:     "14px",
                border:     `2px solid rgba(99,120,255,0.2)`,
                borderTop:  `2px solid ${colour}`,
                borderRadius: "50%",
                display:    "inline-block",
                animation:  "spin 0.8s linear infinite",
              }}
            />
          )}
          {label}
        </span>
        <span
          style={{
            fontSize:   "0.82rem",
            fontWeight: 600,
            color:      colour,
            fontFamily: "var(--font-mono)",
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress track */}
      <div
        style={{
          width:        "100%",
          height:       "8px",
          background:   "rgba(255,255,255,0.05)",
          borderRadius: "var(--radius-full)",
          overflow:     "hidden",
          border:       "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            height:       "100%",
            width:        `${pct}%`,
            background:   `linear-gradient(90deg, ${colour}, ${colour}cc)`,
            borderRadius: "var(--radius-full)",
            transition:   "width 0.35s ease",
            animation:    status !== "done" && status !== "error"
              ? "progressPulse 2s ease infinite"
              : "none",
          }}
        />
      </div>
    </div>
  );
}
