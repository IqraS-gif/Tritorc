/**
 * useScanner.js — Custom React hook managing the full scan lifecycle.
 *
 * State managed:
 *   - files        : Selected File[] objects
 *   - results      : ScanResult[] from the API
 *   - status       : "idle" | "uploading" | "scanning" | "done" | "error"
 *   - uploadProgress: 0–100 upload percentage
 *   - toasts       : Array of { id, type, message } notifications
 */

import { useState, useCallback } from "react";
import { scanDocuments as apiScan, downloadReport as apiDownload, downloadDetailedReport as apiDownloadDetailed } from "../services/api";


let toastId = 0;

export function useScanner() {
  const [files, setFiles]           = useState([]);
  const [results, setResults]       = useState([]);
  const [status, setStatus]         = useState("idle"); // idle | uploading | scanning | done | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toasts, setToasts]         = useState([]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((type, message, duration = 5000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── File management ────────────────────────────────────────────────────────
  const addFiles = useCallback((newFiles) => {
    const VALID_TYPES = ["application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const VALID_EXTS  = [".pdf", ".docx"];

    const accepted = [];
    const rejected = [];

    newFiles.forEach((file) => {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (VALID_TYPES.includes(file.type) || VALID_EXTS.includes(ext)) {
        accepted.push(file);
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length > 0) {
      addToast("error", `Rejected ${rejected.length} unsupported file(s): ${rejected.join(", ")}`);
    }

    setFiles((prev) => {
      // Deduplicate by file name + size
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique   = accepted.filter((f) => !existing.has(`${f.name}-${f.size}`));
      if (unique.length === 0 && accepted.length > 0) {
        addToast("warning", "Those files have already been added.");
      }
      return [...prev, ...unique];
    });
  }, [addToast]);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setResults([]);
    setStatus("idle");
    setUploadProgress(0);
  }, []);

  // ── Scan ───────────────────────────────────────────────────────────────────
  const scan = useCallback(async () => {
    if (files.length === 0) {
      addToast("warning", "Please add at least one file before scanning.");
      return;
    }

    try {
      setStatus("uploading");
      setUploadProgress(0);
      setResults([]);

      const data = await apiScan(files, (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          // Reserve last 10% for server-side processing
          setUploadProgress(Math.min(pct, 90));
        }
      });

      setStatus("scanning");
      setUploadProgress(95);

      // Small delay so users see the "scanning" state
      await new Promise((r) => setTimeout(r, 600));

      setUploadProgress(100);
      setResults(data.results || []);
      setStatus("done");

      const errorCount = (data.results || []).filter((r) => r.error).length;
      if (errorCount > 0) {
        addToast("warning", `Scan complete — ${errorCount} file(s) had extraction errors.`);
      } else {
        addToast("success", `Successfully scanned ${files.length} document(s).`);
      }
    } catch (err) {
      setStatus("error");
      const msg =
        err?.response?.data?.message || err.message || "Scan failed. Please try again.";
      addToast("error", msg, 8000);
    }
  }, [files, addToast]);

  // ── Download (standard summary) ───────────────────────────────────────────
  const downloadReport = useCallback(async () => {
    if (results.length === 0) {
      addToast("warning", "No results to export. Please scan documents first.");
      return;
    }

    try {
      addToast("info", "Generating Excel report...", 3000);
      const blob = await apiDownload(results);

      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ts   = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.href     = url;
      link.download  = `Tritorc_Scan_Report_${ts}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast("success", "Report downloaded successfully!");
    } catch (err) {
      addToast("error", "Failed to download report. Please try again.", 6000);
    }
  }, [results, addToast]);

  // ── Download (detailed 24-column) ─────────────────────────────────────────
  const downloadDetailedReport = useCallback(async () => {
    if (results.length === 0) {
      addToast("warning", "No results to export. Please scan documents first.");
      return;
    }

    try {
      addToast("info", "Generating detailed Excel report...", 3000);
      const blob = await apiDownloadDetailed(results);

      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ts   = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.href     = url;
      link.download  = `Tritorc_Detailed_Report_${ts}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast("success", "Detailed report downloaded!");
    } catch (err) {
      addToast("error", "Failed to download detailed report. Please try again.", 6000);
    }
  }, [results, addToast]);


  // ── Derived stats ──────────────────────────────────────────────────────────
  const summary = {
    total:       results.length,
    relevant:    results.filter((r) => r.relevance === "High Relevance").length,
    possible:    results.filter((r) => r.relevance === "Possible").length,
    notRelevant: results.filter((r) => r.relevance === "No Relevance").length,
    errors:      results.filter((r) => r.error).length,
  };

  return {
    files, results, status, uploadProgress, toasts, summary,
    addFiles, removeFile, clearAll, scan, downloadReport, downloadDetailedReport, removeToast,
  };
}

