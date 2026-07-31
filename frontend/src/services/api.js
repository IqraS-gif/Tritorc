/**
 * api.js — Axios-based API client for Tritorc Relevance Checker frontend.
 *
 * Base URL is read from the VITE_API_URL environment variable.
 * Falls back to "/api" to leverage the Vite dev proxy during development.
 */

import axios from "axios";

// In production, set VITE_API_URL to the deployed backend URL, e.g.:
// VITE_API_URL=https://api.tritorc-checker.example.com/api
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 minutes — large PDFs can take time
});

/**
 * Upload files for keyword scanning.
 *
 * @param {File[]} files - Array of File objects from the drag-and-drop zone
 * @param {(progressEvent: ProgressEvent) => void} onUploadProgress - Axios progress callback
 * @returns {Promise<{ results: ScanResult[] }>}
 */
export async function scanDocuments(files, onUploadProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await apiClient.post("/scan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

  return response.data;
}

/**
 * Download a standard 4-column Excel summary report.
 *
 * @param {ScanResult[]} results - Array of scan result objects
 * @returns {Promise<Blob>} Excel file as a Blob
 */
export async function downloadReport(results) {
  const response = await apiClient.post(
    "/report",
    { results },
    { responseType: "blob" }
  );
  return response.data;
}

/**
 * Download a detailed 24-column Excel report (mirrors sample_tender_scan_report layout).
 * Fields not present in the source document are shown as "Not Found".
 *
 * @param {ScanResult[]} results - Array of scan result objects
 * @returns {Promise<Blob>} Excel file as a Blob
 */
export async function downloadDetailedReport(results) {
  const response = await apiClient.post(
    "/report/detailed",
    { results },
    { responseType: "blob" }
  );
  return response.data;
}

/**
 * Fetch scan history from MongoDB.
 */
export async function getHistory() {
  const response = await apiClient.get("/history");
  return response.data;
}

/**
 * Clear all scan history in MongoDB.
 */
export async function clearHistory() {
  const response = await apiClient.delete("/history");
  return response.data;
}

/**
 * Delete a specific scan batch from MongoDB history.
 */
export async function deleteHistoryBatch(id) {
  const response = await apiClient.delete(`/history/${id}`);
  return response.data;
}

