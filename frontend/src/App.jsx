/**
 * App.jsx — Root application component for Tritorc Relevance Checker.
 * Theme: Red & White Light Theme (High Contrast, Clean, No Gradients, No Emojis)
 */

import React, { useState, useEffect } from "react";
import { DropZone } from "./components/DropZone.jsx";
import { ProgressBar } from "./components/ProgressBar.jsx";
import { ScanSummary } from "./components/ScanSummary.jsx";
import { ResultsTable } from "./components/ResultsTable.jsx";
import { ScanHistoryModal } from "./components/ScanHistory.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { FlipFadeText } from "./components/ui/flip-fade-text.jsx";
import { useScanner } from "./hooks/useScanner.js";

const TOTAL_KEYWORDS = 20;

export default function App() {
  const {
    files, results, status, uploadProgress, toasts, summary,
    history, dbConnected, fetchHistory, handleClearHistory, handleDeleteBatch, loadBatch,
    addFiles, removeFile, clearAll, scan, downloadReport, downloadDetailedReport, removeToast,
  } = useScanner();

  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const isActive = status === "uploading" || status === "scanning";
  const isDone = status === "done";

  return (
    <>
      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Scan History Modal ───────────────────────────────────────────── */}
      <ScanHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        dbConnected={dbConnected}
        onSelectBatch={loadBatch}
        onClearHistory={handleClearHistory}
        onDeleteBatch={handleDeleteBatch}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid var(--clr-border)",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div className="container app-header-inner">
          {/* Logo + title */}
          <div className="app-logo-group">
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--clr-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="app-logo-text">
              <h1>Tritorc Relevance Checker</h1>
              <p>Intelligent tender document scanner</p>
            </div>
          </div>

          {/* Status pill + History button */}
          <div className="app-status-pill">
            <span style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--clr-text-secondary)",
              background: "#f1f5f9",
              border: "1px solid var(--clr-border)",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              whiteSpace: "nowrap",
            }}>
              {TOTAL_KEYWORDS} keywords
            </span>

            {/* History tab button */}
            <button
              id="history-tab-btn"
              className="btn btn-primary btn-sm"
              onClick={() => setHistoryOpen(true)}
              title="Open MongoDB scan history"
              style={{
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 700,
                boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              Scan History
              <span style={{
                background: "#ffffff",
                color: "var(--clr-primary)",
                borderRadius: "var(--radius-full)",
                padding: "1px 7px",
                fontSize: "0.72rem",
                fontWeight: 800,
                marginLeft: "2px",
              }}>
                {history.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "var(--space-xl) 0" }}>
        <div className="container">

          {/* ── Hero text ──────────────────────────────────────────────── */}
          <div className="hero-section">
            <h1>
              <FlipFadeText
                words={[
                  "Scan Tender Documents",
                  "Analyze Scope of Work",
                  "Match Bolting Tenders",
                  "Check Procurement Relevance",
                ]}
                duration={2800}
                style={{ color: "var(--clr-primary)" }}
              />
            </h1>
            <p>
              Upload PDF or DOCX files and instantly discover which tenders mention
              Tritorc's industrial bolting products and services.
            </p>
          </div>

          {/* ── Upload Card ─────────────────────────────────────────────── */}
          <div className="glass-card upload-card">
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
            <div className="action-buttons">
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
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    {status === "uploading" ? "Uploading..." : "Scanning..."}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {isDone ? "Re-scan Documents" : "Scan Documents"}
                  </>
                )}
              </button>

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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
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

                {/* Download CTAs at bottom */}
                <div className="download-buttons-bar">
                  <button
                    id="download-btn-bottom"
                    className="btn btn-accent"
                    onClick={downloadReport}
                    aria-label="Download standard Excel report from bottom"
                    title="4 columns: Document, Keywords, Count, Relevance"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Summary (.xlsx)
                  </button>
                  <button
                    id="download-detailed-btn-bottom"
                    className="btn btn-ghost"
                    onClick={downloadDetailedReport}
                    aria-label="Download detailed 24-column Excel report from bottom"
                    title="24 columns: full tender metadata + keywords + relevance"
                    style={{ borderColor: "var(--clr-primary)", color: "var(--clr-primary)" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Detailed (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Empty state tips ────────────────────────────────────────── */}
          {status === "idle" && files.length === 0 && (
            <div className="feature-cards">
              {[
                { label: "20 Keywords", desc: "Covering all Tritorc product lines" },
                { label: "Fuzzy Matching", desc: "Handles plurals & word variants" },
                { label: "Excel Export", desc: "Colour-coded relevance report" },
                { label: "Deterministic", desc: "Lightweight, exact, no cloud AI needed" },
              ].map((feat) => (
                <div key={feat.label} className="feature-card">
                  <div className="feature-card-header">
                    <span>{feat.label}</span>
                    <span className="feature-card-dots">
                      <span className="dot dot-red" />
                      <span className="dot dot-black" />
                    </span>
                  </div>
                  <div className="feature-card-body">
                    {feat.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--clr-border)",
        padding: "20px 0",
        textAlign: "center",
        background: "#ffffff",
      }}>
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
