/**
 * DropZone.jsx — Drag-and-drop file upload zone.
 *
 * Props:
 *   - onFilesAdded (fn)  : Called with File[] when files are accepted
 *   - files       (File[]): Currently staged files
 *   - onRemove    (fn)   : Called with file index to remove
 *   - disabled    (bool) : Disable interaction during scan
 */

import React, { useCallback } from "react";
import { useDropzone }        from "react-dropzone";

/** SVG Document Icon */
function DocumentIcon({ ext }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={ext === "pdf" ? "#dc2626" : "#2563eb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

/** Format bytes to human-readable string */
function formatSize(bytes) {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DropZone({ onFilesAdded, files, onRemove, disabled }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!disabled && acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded, disabled]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    disabled,
    multiple: true,
  });

  const borderColour = isDragReject
    ? "var(--clr-danger)"
    : isDragActive
    ? "var(--clr-primary)"
    : "var(--clr-border)";

  const bgColour = isDragReject
    ? "#fee2e2"
    : isDragActive
    ? "#fef2f2"
    : "#ffffff";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      <div
        {...getRootProps()}
        id="drop-zone"
        role="button"
        aria-label="Drag and drop PDF or DOCX files here, or click to browse"
        tabIndex={disabled ? -1 : 0}
        style={{
          border:       `2px dashed ${borderColour}`,
          borderRadius: "var(--radius-lg)",
          padding:      "40px 24px",
          textAlign:    "center",
          cursor:       disabled ? "not-allowed" : "pointer",
          background:   bgColour,
          transition:   "all 0.2s ease",
          opacity:      disabled ? 0.6 : 1,
          outline:      "none",
          position:     "relative",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--clr-primary)")}
        onBlur={(e)  => (e.currentTarget.style.borderColor = borderColour)}
      >
        <input {...getInputProps()} id="file-input" aria-label="File input" />

        {/* Upload icon */}
        <div
          style={{
            width:        "56px",
            height:       "56px",
            borderRadius: "50%",
            background:   "var(--clr-primary-dim)",
            border:       "1px solid #fca5a5",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            margin:       "0 auto 16px",
            transition:   "transform 0.2s ease",
            transform:    isDragActive ? "scale(1.05)" : "scale(1)",
          }}
        >
          <svg
            width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="var(--clr-primary)"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          </svg>
        </div>

        {/* Text */}
        {isDragReject ? (
          <p style={{ color: "var(--clr-danger)", fontWeight: 600, margin: 0 }}>
            Only PDF and DOCX files are supported
          </p>
        ) : isDragActive ? (
          <p style={{ color: "var(--clr-primary)", fontWeight: 600, fontSize: "1.05rem", margin: 0 }}>
            Release to add files
          </p>
        ) : (
          <>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px", color: "var(--clr-text-primary)" }}>
              Drop your documents here
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--clr-text-secondary)", margin: 0 }}>
              Drag & drop <strong style={{ color: "var(--clr-text-primary)" }}>PDF</strong> or{" "}
              <strong style={{ color: "var(--clr-text-primary)" }}>DOCX</strong> files, or{" "}
              <span style={{ color: "var(--clr-primary)", fontWeight: 600, textDecoration: "underline" }}>click to browse</span>
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)", marginTop: "6px" }}>
              Up to 20 files • Max 20 MB each
            </p>
          </>
        )}
      </div>

      {/* ── Staged File List ──────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "8px",
            animation:     "fadeIn 0.25s ease",
          }}
        >
          <p style={{
            fontSize: "0.78rem",
            color: "var(--clr-text-muted)",
            marginBottom: "2px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 700,
          }}>
            {files.length} file{files.length !== 1 ? "s" : ""} queued
          </p>

          {files.map((file, index) => {
            const ext = file.name.split(".").pop().toLowerCase();
            return (
              <div
                key={`${file.name}-${file.size}-${index}`}
                style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "12px",
                  padding:       "10px 14px",
                  background:    "#ffffff",
                  borderRadius:  "var(--radius-md)",
                  border:        "1px solid var(--clr-border)",
                  animation:     "slideIn 0.2s ease",
                }}
              >
                <DocumentIcon ext={ext} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize:     "0.88rem",
                    fontWeight:   600,
                    color:        "var(--clr-text-primary)",
                    margin:       0,
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}>
                    {file.name}
                  </p>
                  <p style={{
                    fontSize: "0.75rem",
                    color:    "var(--clr-text-muted)",
                    margin:   0,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {formatSize(file.size)}
                  </p>
                </div>

                <button
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  style={{
                    flexShrink:   0,
                    background:   "none",
                    border:       "none",
                    cursor:       disabled ? "not-allowed" : "pointer",
                    color:        "var(--clr-text-muted)",
                    fontSize:     "18px",
                    lineHeight:   1,
                    padding:      "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    transition:   "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.color = "var(--clr-danger)";
                      e.currentTarget.style.background = "#fee2e2";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--clr-text-muted)";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
