/**
 * DocumentViewerModal.jsx — Popup modal for viewing documents with
 * PDF.js canvas keyword highlighting, page navigation, search, and match navigation.
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { PdfCanvasViewer } from "./PdfCanvasViewer.jsx";

const KEYWORD_PATTERNS = {
  "Hydraulic torque wrench": /\bhydraulic\s+torque\s+wrench(es|ing|ed)?\b/gi,
  "Bolt tensioner": /\bbolt\s+tension(er|ers|ing|ed|s)?\b/gi,
  "Hydraulic bolt tensioning": /\bhydraulic\s+bolt\s+tension(ing|ed|er|ers|s)?\b/gi,
  "Controlled bolting": /\bcontrolled\s+bolt(ing|ed|s)?\b/gi,
  "Flange management": /\bflange\s+manag(ing|ement|er|ers)?\b/gi,
  "Flange joint integrity": /\bflange\s+joint\s+(integrit(y|ies)|assurance)\b/gi,
  "Torque wrench": /\btorque\s+wrench(es|ing|ed)?\b/gi,
  "Stud bolt tensioning": /\bstud\s+bolt\s+tension(ing|ed|er|ers|s)?\b/gi,
  "Nut splitter": /\bnut\s+splitt(er|ers|ing|ed)?\b/gi,
  "Torque multiplier": /\btorque\s+multipli(er|ers|cation|ed)?\b/gi,
  "Bolting tools": /\bbolting\s+(tool(s|ing|ed)?|equipment)\b/gi,
  "Flange bolt tightening": /\bflange\s+bolt\s+tighten(ing|ed|er|ers)?\b/gi,
  "Turnaround services": /\bturn-?around\s+service(s|ing|d)?\b/gi,
  "Shutdown maintenance": /\bshut-?down\s+mainten(ance|ing|ed)?\b/gi,
  "Plant shutdown": /\bplant\s+shut(-?down|s)?\b/gi,
  "Bolted joint": /\bbolted\s+joint(s|ing|ed)?\b/gi,
  "Pre-tensioning": /\bpre[-\s]tension(ing|ed|er|ers|s)?\b/gi,
  "Gasket and flange management": /\bgasket\s+(&|and)\s+flange\s+management\b/gi,
  "Torque calibration": /\btorque\s+calibrat(ion|ing|ed|or|ors)?\b/gi,
  "Mechanical bolting": /\bmechanical\s+bolt(ing|ed|s)?\b/gi,
};

function RelevanceBadge({ relevance }) {
  const map = {
    "High Relevance": { bg: "#dcfce7", color: "#15803d", dot: "#16a34a", label: "High Relevance" },
    Possible:         { bg: "#fef3c7", color: "#b45309", dot: "#d97706", label: "Possible"       },
    "No Relevance":   { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626", label: "No Relevance"   },
    Error:            { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626", label: "Error"          },
  };
  const cfg = map[relevance] || map.Error;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 700,
      background: cfg.bg,
      color: cfg.color,
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

export function DocumentViewerModal({ isOpen, onClose, result }) {
  const [viewMode, setViewMode] = useState("VISUAL"); // "VISUAL" | "TEXT"
  const [selectedKeyword, setSelectedKeyword] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);
  const [canvasMatchesCount, setCanvasMatchesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  // Lock background body scroll & close on Escape key press
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset controls when modal opens or document changes
  useEffect(() => {
    if (isOpen) {
      setViewMode("VISUAL");
      setSelectedKeyword("ALL");
      setSearchTerm("");
      setActiveMatchIdx(0);
      setCopied(false);
    }
  }, [isOpen, result]);

  const rawText = result?.text || "";
  const htmlContent = result?.html || "";
  const matchedKeywords = result?.matchedKeywords || [];
  const isPdf = result?.fileName?.toLowerCase().endsWith(".pdf");

  // Build combined Regex for text mode highlighting
  const { highlightedParts, totalTextMatchesCount } = useMemo(() => {
    if (!rawText) return { highlightedParts: [], totalTextMatchesCount: 0 };

    const regexSources = [];

    const keywordsToHighlight = selectedKeyword === "ALL"
      ? matchedKeywords
      : matchedKeywords.filter((k) => k === selectedKeyword);

    keywordsToHighlight.forEach((kw) => {
      if (KEYWORD_PATTERNS[kw]) {
        regexSources.push(KEYWORD_PATTERNS[kw].source);
      } else {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regexSources.push(`\\b${escaped}\\b`);
      }
    });

    if (searchTerm.trim()) {
      const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      regexSources.push(escaped);
    }

    if (regexSources.length === 0) {
      return {
        highlightedParts: [{ text: rawText, isMatch: false, matchIdx: -1 }],
        totalTextMatchesCount: 0,
      };
    }

    const combinedRegex = new RegExp(`(${regexSources.join("|")})`, "gi");
    const parts = [];
    let lastIndex = 0;
    let matchCount = 0;

    let match;
    while ((match = combinedRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: rawText.substring(lastIndex, match.index),
          isMatch: false,
          matchIdx: -1,
        });
      }

      parts.push({
        text: match[0],
        isMatch: true,
        matchIdx: matchCount,
      });

      matchCount++;
      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push({
        text: rawText.substring(lastIndex),
        isMatch: false,
        matchIdx: -1,
      });
    }

    return { highlightedParts: parts, totalTextMatchesCount: matchCount };
  }, [rawText, matchedKeywords, selectedKeyword, searchTerm]);

  const activeTotalMatches = isPdf && viewMode === "VISUAL" ? canvasMatchesCount : totalTextMatchesCount;

  // Scroll active match into view
  useEffect(() => {
    if (viewMode === "TEXT" && totalTextMatchesCount > 0 && contentRef.current) {
      const activeEl = contentRef.current.querySelector(`.doc-match-active`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeMatchIdx, totalTextMatchesCount, viewMode]);

  const handleNext = () => {
    if (activeTotalMatches > 0) {
      setActiveMatchIdx((prev) => (prev + 1) % activeTotalMatches);
    }
  };

  const handlePrev = () => {
    if (activeTotalMatches > 0) {
      setActiveMatchIdx((prev) => (prev - 1 + activeTotalMatches) % activeTotalMatches);
    }
  };

  const handleCopyText = () => {
    if (rawText) {
      navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Process DOCX HTML with highlights
  const highlightedDocxHtml = useMemo(() => {
    if (!htmlContent) return "";
    let processed = htmlContent;

    matchedKeywords.forEach((kw) => {
      const pattern = KEYWORD_PATTERNS[kw] || new RegExp(`\\b${kw}\\b`, "gi");
      processed = processed.replace(pattern, (match) => `<mark class="kw-highlight">${match}</mark>`);
    });

    return processed;
  }, [htmlContent, matchedKeywords]);

  if (!isOpen || !result) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-viewer-title"
    >
      <div className="doc-modal-container">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="doc-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke={isPdf ? "#dc2626" : "#2563eb"}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <div style={{ minWidth: 0 }}>
              <h2 id="doc-viewer-title" className="doc-modal-title">
                {result.fileName}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <RelevanceBadge relevance={result.relevance} />
                <span className="doc-header-stat">
                  {matchedKeywords.length} keyword{matchedKeywords.length !== 1 ? "s" : ""} matched
                </span>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="doc-view-mode-tabs">
            <button
              className={`doc-mode-tab ${viewMode === "VISUAL" ? "active" : ""}`}
              onClick={() => setViewMode("VISUAL")}
            >
              📄 Visual Document View
            </button>
            <button
              className={`doc-mode-tab ${viewMode === "TEXT" ? "active" : ""}`}
              onClick={() => setViewMode("TEXT")}
            >
              🔍 Extracted Text View
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleCopyText}
              className="btn btn-ghost btn-sm"
              title="Copy extracted document text"
              style={{ fontSize: "0.78rem" }}
            >
              {copied ? "Copied!" : "Copy Text"}
            </button>
            <button
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close document modal"
            >
              &times;
            </button>
          </div>
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────── */}
        <div className="doc-modal-toolbar">
          <div className="doc-keywords-filter">
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--clr-text-secondary)" }}>
              Keywords:
            </span>
            <button
              className={`doc-filter-chip ${selectedKeyword === "ALL" ? "active" : ""}`}
              onClick={() => { setSelectedKeyword("ALL"); setActiveMatchIdx(0); }}
            >
              All ({matchedKeywords.length})
            </button>
            {matchedKeywords.map((kw) => (
              <button
                key={kw}
                className={`doc-filter-chip ${selectedKeyword === kw ? "active" : ""}`}
                onClick={() => { setSelectedKeyword(kw); setActiveMatchIdx(0); }}
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="doc-toolbar-right">
            <div className="doc-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--clr-text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Find in document..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveMatchIdx(0); }}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setActiveMatchIdx(0); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-text-muted)" }}
                >
                  &times;
                </button>
              )}
            </div>

            {activeTotalMatches > 0 && (
              <div className="doc-match-nav">
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--clr-text-secondary)" }}>
                  Match {activeMatchIdx + 1} of {activeTotalMatches}
                </span>
                <div style={{ display: "flex", gap: "2px" }}>
                  <button onClick={handlePrev} className="doc-nav-btn" title="Previous match">&#9650;</button>
                  <button onClick={handleNext} className="doc-nav-btn" title="Next match">&#9660;</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Document Body Content ──────────────────────────────────── */}
        <div
          className="doc-modal-body"
          ref={contentRef}
          style={{ padding: isPdf && viewMode === "VISUAL" ? "16px 0" : "24px" }}
        >
          {/* VISUAL MODE: PDF.js Canvas with Highlight Overlay OR Formatted DOCX HTML */}
          {viewMode === "VISUAL" && (
            isPdf ? (
              (result.blobUrl || result.fileObj) ? (
                <PdfCanvasViewer
                  blobUrl={result.blobUrl}
                  fileObj={result.fileObj}
                  matchedKeywords={matchedKeywords}
                  selectedKeyword={selectedKeyword}
                  searchTerm={searchTerm}
                  activeMatchIdx={activeMatchIdx}
                  onMatchesFound={setCanvasMatchesCount}
                />
              ) : (
                <div className="doc-empty-state">
                  <p style={{ fontWeight: 600, color: "var(--clr-text-secondary)" }}>
                    Visual PDF canvas rendering active for session uploaded documents. Switch to <strong>Extracted Text View</strong> to inspect document text.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "12px" }}
                    onClick={() => setViewMode("TEXT")}
                  >
                    Switch to Extracted Text View
                  </button>
                </div>
              )
            ) : htmlContent ? (
              <div
                className="doc-formatted-html"
                dangerouslySetInnerHTML={{ __html: highlightedDocxHtml }}
              />
            ) : (
              <div className="doc-text-container">
                {rawText || "No text available."}
              </div>
            )
          )}

          {/* EXTRACTED TEXT MODE */}
          {viewMode === "TEXT" && (
            !rawText ? (
              <div className="doc-empty-state">
                <p style={{ fontWeight: 600, color: "var(--clr-text-secondary)" }}>
                  {result.error ? `Error: ${result.error}` : "No text content available."}
                </p>
              </div>
            ) : (
              <div className="doc-text-container">
                {highlightedParts.map((part, i) => {
                  if (!part.isMatch) {
                    return <React.Fragment key={i}>{part.text}</React.Fragment>;
                  }
                  const isActive = part.matchIdx === activeMatchIdx;
                  return (
                    <mark
                      key={i}
                      className={`kw-highlight ${isActive ? "doc-match-active" : ""}`}
                      data-match-idx={part.matchIdx}
                    >
                      {part.text}
                    </mark>
                  );
                })}
              </div>
            )
          )}

        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="doc-modal-footer">
          <span style={{ fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>
            Visual PDF canvas page view with real-time keyword highlight overlay.
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
