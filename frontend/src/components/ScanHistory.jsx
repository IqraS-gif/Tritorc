/**
 * ScanHistory.jsx — Modal dialog displaying MongoDB scan history batches
 * with load & delete capabilities.
 *
 * Props:
 *   - isOpen         : boolean
 *   - onClose        : () => void
 *   - history        : Array of scan batch objects from MongoDB
 *   - dbConnected    : boolean
 *   - onSelectBatch  : (results: Array) => void — reloads historical results into main view
 *   - onClearHistory : () => void — clears history in MongoDB
 *   - onDeleteBatch  : (id: string) => void — deletes specific batch
 */

import React, { useState, useEffect } from "react";
import { DocumentViewerModal } from "./DocumentViewerModal.jsx";

export function ScanHistoryModal({
  isOpen,
  onClose,
  history,
  dbConnected,
  onSelectBatch,
  onClearHistory,
  onDeleteBatch,
}) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedBatches, setExpandedBatches] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Expand all batches by default for quick access
      if (history && history.length > 0) {
        const initial = {};
        history.forEach((b) => {
          initial[b._id] = true;
        });
        setExpandedBatches(initial);
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, history]);

  const toggleBatch = (id) => {
    setExpandedBatches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Nested Document Viewer Modal for viewing selected historical document */}
      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        result={selectedDoc}
      />

      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      >
        <div
          className="glass-card"
          style={{
            width:        "100%",
            maxWidth:     "760px",
            maxHeight:    "85vh",
            display:      "flex",
            flexDirection: "column",
            background:   "#ffffff",
            boxShadow:    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            overflow:     "hidden",
            animation:    "fadeIn 0.25s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "18px 24px",
            borderBottom:   "1px solid var(--clr-border)",
            background:     "#f8fafc",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width:        "4px",
                height:       "20px",
                background:   "var(--clr-primary)",
                borderRadius: "var(--radius-full)",
              }} />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--clr-text-primary)", margin: 0 }}>
                MongoDB Scan History
              </h2>
              <span style={{
                fontSize:     "0.75rem",
                fontWeight:   600,
                color:        dbConnected ? "#15803d" : "#b45309",
                background:   dbConnected ? "#f0fdf4" : "#fffbeb",
                border:       `1px solid ${dbConnected ? "#bbf7d0" : "#fde68a"}`,
                padding:      "2px 10px",
                borderRadius: "var(--radius-full)",
              }}>
                {dbConnected ? "MongoDB Connected" : "Memory Mode"}
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background:   "none",
                border:       "none",
                fontSize:     "20px",
                cursor:       "pointer",
                color:        "var(--clr-text-muted)",
                padding:      "4px 8px",
                borderRadius: "var(--radius-sm)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--clr-danger)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--clr-text-muted)"; }}
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
            {!dbConnected && history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ color: "var(--clr-text-secondary)", fontWeight: 600, margin: 0 }}>
                  MongoDB is offline (Memory-only mode active)
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--clr-text-muted)", marginTop: "6px" }}>
                  Start your local MongoDB service or set <code style={{ background: "#f1f5f9", padding: "2px 6px" }}>MONGODB_URI</code> in <code style={{ background: "#f1f5f9", padding: "2px 6px" }}>backend/.env</code> to enable automatic database storage.
                </p>
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem", margin: 0 }}>
                  No scan history saved yet. Scans automatically save here when MongoDB is connected.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {history.map((batch) => {
                  const dateStr = new Date(batch.scannedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  const isExpanded = expandedBatches[batch._id] !== false;
                  const docs = batch.results || [];

                  return (
                    <div
                      key={batch._id}
                      style={{
                        background:     "#ffffff",
                        border:         "1px solid var(--clr-border)",
                        borderRadius:   "var(--radius-md)",
                        overflow:       "hidden",
                        boxShadow:      "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Batch Header Bar */}
                      <div
                        style={{
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "space-between",
                          padding:        "12px 16px",
                          background:     "#f8fafc",
                          borderBottom:   isExpanded ? "1px solid var(--clr-border)" : "none",
                          flexWrap:       "wrap",
                          gap:            "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            onClick={() => toggleBatch(batch._id)}
                            style={{
                              background:   "none",
                              border:       "none",
                              cursor:       "pointer",
                              padding:      "2px 6px",
                              fontSize:     "0.75rem",
                              color:        "var(--clr-text-secondary)",
                              fontWeight:   700,
                            }}
                            title={isExpanded ? "Collapse document list" : "Expand document list"}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--clr-text-primary)" }}>
                              Scan Batch • {batch.totalFiles} Document{batch.totalFiles !== 1 ? "s" : ""}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>
                              {dateStr}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown badges + Load Batch Button */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <span className="badge-yes" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                            {batch.highRelevanceCount || 0} High
                          </span>
                          <span className="badge-possible" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                            {batch.possibleCount || 0} Possible
                          </span>
                          <span className="badge-no" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                            {batch.noRelevanceCount || 0} No Rel.
                          </span>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              onSelectBatch(batch.results);
                              onClose();
                            }}
                            title="Load all documents from this batch into main table"
                            style={{ fontSize: "0.78rem", padding: "5px 12px", fontWeight: 700 }}
                          >
                            Load Batch Results
                          </button>
                        </div>
                      </div>

                      {/* Scanned Documents List in Batch */}
                      {isExpanded && (
                        <div style={{ padding: "8px 16px 12px 16px", background: "#ffffff" }}>
                          {docs.length === 0 ? (
                            <p style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", margin: "6px 0" }}>
                              No individual document details stored in this batch.
                            </p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                              {docs.map((doc, docIdx) => {
                                const isPdf = doc.fileName?.toLowerCase().endsWith(".pdf");
                                return (
                                  <div
                                    key={`${doc.fileName}-${docIdx}`}
                                    style={{
                                      display:        "flex",
                                      alignItems:     "center",
                                      justifyContent: "space-between",
                                      padding:        "8px 12px",
                                      background:     docIdx % 2 === 0 ? "#f8fafc" : "#ffffff",
                                      borderRadius:   "var(--radius-sm)",
                                      border:         "1px solid #f1f5f9",
                                      gap:            "10px",
                                      flexWrap:       "wrap",
                                    }}
                                  >
                                    {/* Document Icon & Name */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke={isPdf ? "#dc2626" : "#2563eb"}
                                        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                      </svg>
                                      <span style={{
                                        fontSize:     "0.84rem",
                                        fontWeight:   600,
                                        color:        "var(--clr-text-primary)",
                                        wordBreak:    "break-word",
                                      }}>
                                        {doc.fileName}
                                      </span>
                                    </div>

                                    {/* Matches & Relevance */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                      <span style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)", fontWeight: 600 }}>
                                        {doc.matchCount || 0} match{(doc.matchCount || 0) !== 1 ? "es" : ""}
                                      </span>

                                      <span
                                        className={
                                          doc.relevance === "High Relevance"
                                            ? "badge-yes"
                                            : doc.relevance === "Possible"
                                            ? "badge-possible"
                                            : "badge-no"
                                        }
                                        style={{ fontSize: "0.7rem", padding: "1px 8px" }}
                                      >
                                        {doc.relevance}
                                      </span>

                                      {/* View Document Button */}
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setSelectedDoc(doc)}
                                        title={`View scanned text & keywords for ${doc.fileName}`}
                                        style={{
                                          fontSize:     "0.75rem",
                                          padding:      "4px 10px",
                                          display:      "inline-flex",
                                          alignItems:   "center",
                                          gap:          "5px",
                                          borderRadius: "var(--radius-sm)",
                                          fontWeight:   600,
                                          borderColor:  "var(--clr-border)",
                                        }}
                                      >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        View Document
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          {history.length > 0 && (
            <div style={{
              padding:        "14px 24px",
              borderTop:      "1px solid var(--clr-border)",
              background:     "#f8fafc",
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
            }}>
              <span style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
                {history.length} historical scan batch{history.length !== 1 ? "es" : ""} stored in MongoDB
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

