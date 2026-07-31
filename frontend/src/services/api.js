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
 * Download an Excel report for the given scan results.
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
