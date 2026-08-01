/**
 * PdfCanvasViewer.jsx — PDF.js visual canvas page renderer with overlaid
 * text layer for real-time keyword highlighting and match navigation.
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set PDF.js worker source from CDN matching pdfjs version for clean browser compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  "Pre-tensioning": /\bpre[-\s]?tension(ing|ed|er|ers|s)?\b/gi,
  "Gasket and flange management": /\bgasket\s+(&|and)\s+flange\s+management\b/gi,
  "Torque calibration": /\btorque\s+calibrat(ion|ing|ed|or|ors)?\b/gi,
  "Mechanical bolting": /\bmechanical\s+bolt(ing|ed|s)?\b/gi,
};

export function PdfCanvasViewer({
  blobUrl,
  fileObj,
  matchedKeywords = [],
  selectedKeyword = "ALL",
  searchTerm = "",
  activeMatchIdx = 0,
  onMatchesFound = () => {},
}) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagesData, setPagesData] = useState([]);
  const containerRef = useRef(null);

  // Load PDF Document via PDF.js
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        let loadingTask;
        if (fileObj) {
          const buffer = await fileObj.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: buffer });
        } else if (blobUrl) {
          loadingTask = pdfjsLib.getDocument(blobUrl);
        } else {
          throw new Error("No PDF file data provided.");
        }

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        setNumPages(pdf.numPages);

        // Extract text and viewport info for each page
        const extractedPages = [];
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 1.2 });
          const textContent = await page.getTextContent();

          extractedPages.push({
            pageNumber: p,
            pageObj: page,
            viewport,
            textContent,
          });
        }

        if (!isCancelled) {
          setPagesData(extractedPages);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("PDF loading error:", err);
          setError(err.message || "Failed to render PDF document.");
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [blobUrl, fileObj]);

  // Combine regex sources for keyword highlights
  const combinedRegex = useMemo(() => {
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

    if (regexSources.length === 0) return null;
    return new RegExp(`(${regexSources.join("|")})`, "gi");
  }, [matchedKeywords, selectedKeyword, searchTerm]);

  // Render each page canvas when pagesData is ready
  useEffect(() => {
    if (pagesData.length === 0) return;

    pagesData.forEach(({ pageNumber, pageObj, viewport }) => {
      const canvas = containerRef.current?.querySelector(`#pdf-canvas-${pageNumber}`);
      if (canvas) {
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };
        pageObj.render(renderContext);
      }
    });
  }, [pagesData]);

  // Count total matches and notify parent
  useEffect(() => {
    if (!combinedRegex || pagesData.length === 0) {
      onMatchesFound(0);
      return;
    }

    let matchCount = 0;
    pagesData.forEach(({ textContent }) => {
      const fullPageText = textContent.items.map((item) => item.str).join(" ");
      let m;
      combinedRegex.lastIndex = 0;
      while ((m = combinedRegex.exec(fullPageText)) !== null) {
        matchCount++;
      }
    });

    onMatchesFound(matchCount);
  }, [combinedRegex, pagesData, onMatchesFound]);

  // Scroll active match into view
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector(`.pdf-match-active`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeMatchIdx]);

  if (loading) {
    return (
      <div className="doc-empty-state">
        <div style={{
          width: "28px",
          height: "28px",
          border: "3px solid rgba(220,38,38,0.2)",
          borderTop: "3px solid var(--clr-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ marginTop: "12px", fontSize: "0.85rem", fontWeight: 600, color: "var(--clr-text-secondary)" }}>
          Rendering visual PDF pages with keyword highlights...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doc-empty-state">
        <p style={{ fontWeight: 600, color: "var(--clr-danger)" }}>
          PDF Rendering Error: {error}
        </p>
      </div>
    );
  }

  let globalMatchCounter = 0;

  return (
    <div className="pdf-canvas-container" ref={containerRef}>
      {pagesData.map(({ pageNumber, viewport, textContent }) => {
        return (
          <div
            key={pageNumber}
            className="pdf-page-card"
            style={{
              position: "relative",
              width: `${viewport.width}px`,
              height: `${viewport.height}px`,
              margin: "0 auto 24px auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "4px",
              background: "#ffffff",
              overflow: "hidden",
            }}
          >
            {/* Page header badge */}
            <div className="pdf-page-badge">
              Page {pageNumber} of {numPages}
            </div>

            {/* Canvas for PDF visual rendering */}
            <canvas id={`pdf-canvas-${pageNumber}`} />

            {/* Text Overlay for Keyword Highlighting */}
            <div
              className="pdf-text-layer"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${viewport.width}px`,
                height: `${viewport.height}px`,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              {textContent.items.map((item, itemIdx) => {
                const text = item.str;
                if (!text || !text.trim()) return null;

                // PDF.js transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
                const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
                const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
                const left = tx[4];
                const top = tx[5] - fontSize;

                let contentNodes = [text];
                if (combinedRegex) {
                  const parts = [];
                  let lastIdx = 0;
                  let match;
                  combinedRegex.lastIndex = 0;

                  while ((match = combinedRegex.exec(text)) !== null) {
                    if (match.index > lastIdx) {
                      parts.push(text.substring(lastIdx, match.index));
                    }

                    const currentIdx = globalMatchCounter++;
                    const isActive = currentIdx === activeMatchIdx;

                    parts.push(
                      <mark
                        key={`m-${itemIdx}-${match.index}`}
                        className={`kw-highlight ${isActive ? "pdf-match-active" : ""}`}
                        style={{
                          pointerEvents: "auto",
                          display: "inline-block",
                          lineHeight: "1.1",
                        }}
                      >
                        {match[0]}
                      </mark>
                    );

                    lastIdx = combinedRegex.lastIndex;
                  }

                  if (lastIdx < text.length) {
                    parts.push(text.substring(lastIdx));
                  }

                  if (parts.length > 0) {
                    contentNodes = parts.map((part, pIdx) => {
                      if (typeof part === "string") {
                        return (
                          <span key={`s-${pIdx}`} style={{ color: "transparent", userSelect: "none" }}>
                            {part}
                          </span>
                        );
                      }
                      return part;
                    });
                  }
                }

                // If no match in this string token, skip overlay
                const hasMatch = Array.isArray(contentNodes) && contentNodes.some((n) => n && typeof n !== "string" && n.type === "mark");
                if (!hasMatch) return null;

                return (
                  <div
                    key={itemIdx}
                    style={{
                      position: "absolute",
                      left: `${left}px`,
                      top: `${top}px`,
                      fontSize: `${fontSize}px`,
                      fontFamily: item.fontName || "sans-serif",
                      whiteSpace: "pre",
                      transformOrigin: "left top",
                      lineHeight: "1.1",
                      pointerEvents: "none",
                    }}
                  >
                    {contentNodes}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
