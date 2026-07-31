/**
 * App.jsx — Root application component for Tritorc Relevance Checker.
 * Theme: Red & White Light Theme (High Contrast, Clean, No Gradients, No Emojis)
 */

import React from "react";
import { DropZone }      from "./components/DropZone.jsx";
import { ProgressBar }   from "./components/ProgressBar.jsx";
import { ScanSummary }   from "./components/ScanSummary.jsx";
import { ResultsTable }  from "./components/ResultsTable.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { useScanner }    from "./hooks/useScanner.js";

const TOTAL_KEYWORDS = 20;

export default function App() {
  const {
    files, results, status, uploadProgress, toasts, summary,
    addFiles, removeFile, clearAll, scan, downloadReport, removeToast,
  } = useScanner();

  const isActive = status === "uploading" || status === "scanning";
  const isDone   = status === "done";

  return (
    <>
      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        style={{
          padding:         "0",
          borderBottom:    "1px solid var(--clr-border)",
          background:      "#ffffff",
          position:        "sticky",
          top:             0,
          zIndex:          100,
          boxShadow:       "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="container"
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            height:         "64px",
          }}
        >
          {/* Logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width:        "36px",
                height:       "36px",
                borderRadius: "var(--radius-md)",
                background:   "var(--clr-primary)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                flexShrink:   0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--clr-text-primary)" }}>
                Tritorc Relevance Checker
              </h1>
              <p style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)", margin: 0 }}>
                Intelligent tender document scanner
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isActive ? (
              <span style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "6px",
                fontSize:     "0.78rem",
                fontWeight:   600,
                color:        "var(--clr-primary)",
                background:   "#fef2f2",
                border:       "1px solid #fca5a5",
                padding:      "4px 12px",
                borderRadius: "var(--radius-full)",
              }}>
                <span style={{
                  width:      "8px",
                  height:     "8px",
                  borderRadius: "50%",
                  background: "var(--clr-primary)",
                  animation:  "pulse 1.2s ease infinite",
                  display:    "inline-block",
                }} />
                {status === "uploading" ? "Uploading..." : "Scanning..."}
              </span>
            ) : isDone ? (
              <span style={{
                fontSize:     "0.78rem",
                fontWeight:   600,
                color:        "#15803d",
                background:   "#f0fdf4",
                border:       "1px solid #bbf7d0",
                padding:      "4px 12px",
                borderRadius: "var(--radius-full)",
              }}>
                Scan Complete
              </span>
            ) : (
              <span style={{
                fontSize:     "0.78rem",
                fontWeight:   600,
                color:        "var(--clr-text-secondary)",
                background:   "#f1f5f9",
                border:       "1px solid var(--clr-border)",
                padding:      "4px 12px",
                borderRadius: "var(--radius-full)",
              }}>
                {TOTAL_KEYWORDS} keywords loaded
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "var(--space-xl) 0" }}>
        <div className="container">

          {/* ── Hero text ──────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-xl)", animation: "fadeIn 0.4s ease" }}>
            <h1
              style={{
                fontSize:   "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 800,
                marginBottom: "10px",
                color:        "var(--clr-text-primary)",
              }}
            >
              Scan Tender Documents
            </h1>
            <p style={{ color: "var(--clr-text-secondary)", maxWidth: "560px", margin: "0 auto", fontSize: "0.95rem" }}>
              Upload PDF or DOCX files and instantly discover which tenders mention
              Tritorc's industrial bolting products and services.
            </p>
          </div>

          {/* ── Upload Card ─────────────────────────────────────────────── */}
          <div
            className="glass-card"
            style={{ padding: "var(--space-xl)", marginBottom: "var(--space-lg)" }}
          >
            <DropZone
              onFilesAdded={addFiles}
              files={files}
              onRemove={removeFile}
              disabled={isActive}
            />

            {/* Progress bar */}
            {isActive && (
              <div style={{ marginTop: "24px" }}>
                <ProgressBar progress={uploadProgress} status={status} />
              </div>
            )}

            {/* Action buttons */}
            <div
              style={{
                display:        "flex",
                gap:            "12px",
                marginTop:      "24px",
                flexWrap:       "wrap",
                justifyContent: files.length === 0 && !isDone ? "center" : "flex-start",
              }}
            >
              {/* Scan button */}
              <button
                id="scan-btn"
                className="btn btn-primary btn-lg"
                onClick={scan}
                disabled={isActive || files.length === 0}
                aria-label="Scan uploaded documents"
              >
                {isActive ? (
                  <>
                    <span style={{
                      width:      "16px",
                      height:     "16px",
                      border:     "2px solid rgba(255,255,255,0.4)",
                      borderTop:  "2px solid #fff",
                      borderRadius: "50%",
                      animation:  "spin 0.8s linear infinite",
                    }} />
                    {status === "uploading" ? "Uploading..." : "Scanning..."}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    {isDone ? "Re-scan Documents" : "Scan Documents"}
                  </>
                )}
              </button>

              {/* Download button — only shown when results exist */}
              {isDone && results.length > 0 && (
                <button
                  id="download-btn"
                  className="btn btn-accent"
                  onClick={downloadReport}
                  aria-label="Download Excel report"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Excel Report
                </button>
              )}

              {/* Clear button */}
              {(files.length > 0 || isDone) && (
                <button
                  id="clear-btn"
                  className="btn btn-ghost"
                  onClick={clearAll}
                  disabled={isActive}
                  aria-label="Clear all files and results"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* ── Results Section ─────────────────────────────────────────── */}
          {isDone && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
              {/* Summary cards */}
              <div className="glass-card" style={{ padding: "var(--space-lg)" }}>
                <ScanSummary summary={summary} />
              </div>

              {/* Results table */}
              <div className="glass-card" style={{ padding: "var(--space-lg)" }}>
                <ResultsTable results={results} />

                {/* Download CTA at bottom */}
                <div style={{
                  display:       "flex",
                  justifyContent: "flex-end",
                  marginTop:     "20px",
                  paddingTop:    "16px",
                  borderTop:     "1px solid var(--clr-border)",
                }}>
                  <button
                    id="download-btn-bottom"
                    className="btn btn-accent"
                    onClick={downloadReport}
                    aria-label="Download Excel report from bottom"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export to Excel (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Empty state tips ────────────────────────────────────────── */}
          {status === "idle" && files.length === 0 && (
            <div
              style={{
                display:        "flex",
                gap:            "16px",
                flexWrap:       "wrap",
                justifyContent: "center",
                animation:      "fadeIn 0.4s ease",
              }}
            >
              {[
                { label: "20 Keywords", desc: "Covering all Tritorc product lines" },
                { label: "Fuzzy Matching", desc: "Handles plurals & word variants" },
                { label: "Excel Export", desc: "Colour-coded relevance report" },
                { label: "Deterministic", desc: "Lightweight, exact, no cloud AI needed" },
              ].map((feat) => (
                <div
                  key={feat.label}
                  style={{
                    flex:          "1 1 200px",
                    maxWidth:      "240px",
                    padding:       "16px 20px",
                    background:    "#ffffff",
                    border:        "1px solid var(--clr-border)",
                    borderRadius:  "var(--radius-md)",
                    textAlign:     "center",
                    transition:    "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--clr-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--clr-border)";
                  }}
                >
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--clr-text-primary)", marginBottom: "4px" }}>
                    {feat.label}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
                    {feat.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop:   "1px solid var(--clr-border)",
          padding:     "20px 0",
          textAlign:   "center",
          background:  "#ffffff",
        }}
      >
        <div className="container">
          <p style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", margin: 0 }}>
            © {new Date().getFullYear()} Tritorc · Relevance Checker v1.0 ·{" "}
            <span style={{ color: "var(--clr-text-secondary)" }}>
              Porter Stemmer + regex matching
            </span>
          </p>
        </div>
      </footer>
    </>
  );
}
