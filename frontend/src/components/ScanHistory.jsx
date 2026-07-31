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

import React, { useEffect } from "react";

export function ScanHistoryModal({
  isOpen,
  onClose,
  history,
  dbConnected,
  onSelectBatch,
  onClearHistory,
  onDeleteBatch,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width:        "100%",
          maxWidth:     "680px",
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
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {history.map((batch) => {
                const dateStr = new Date(batch.scannedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={batch._id}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "14px 16px",
                      background:     "#ffffff",
                      border:         "1px solid var(--clr-border)",
                      borderRadius:   "var(--radius-md)",
                      flexWrap:       "wrap",
                      gap:            "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--clr-text-primary)" }}>
                        Scan Batch • {batch.totalFiles} Document{batch.totalFiles !== 1 ? "s" : ""}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>
                        {dateStr}
                      </div>
                    </div>

                    {/* Breakdown badges */}
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
                        title="Load this batch into results table"
                      >
                        Load Results
                      </button>
                    </div>
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
  );
}
