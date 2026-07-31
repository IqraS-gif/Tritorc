/**
 * ScanHistory.js — Mongoose Schema for storing document scan batches in MongoDB.
 */

const mongoose = require("mongoose");

const DocumentResultSchema = new mongoose.Schema({
  fileName:           { type: String, required: true },
  matchedKeywords:    [{ type: String }],
  matchCount:         { type: Number, default: 0 },
  relevance:          { type: String, required: true },
  error:              { type: String, default: null },
  text:               { type: String, default: "" },
  
  // Metadata fields
  tenderId:           { type: String, default: "Not Found" },
  tenderNo:           { type: String, default: "Not Found" },
  authority:          { type: String, default: "Not Found" },
  location:           { type: String, default: "Not Found" },
  openingDate:        { type: String, default: "Not Found" },
  closingDate:        { type: String, default: "Not Found" },
  tenderAmount:       { type: String, default: "Not Found" },
  emd:                { type: String, default: "Not Found" },
  documentCost:       { type: String, default: "Not Found" },
  tenderFee:          { type: String, default: "Not Found" },
  tabName:            { type: String, default: "Not Found" },
  technicalQual:      { type: String, default: "Not Found" },
  financialQual:      { type: String, default: "Not Found" },
  scopeOfWork:        { type: String, default: "Not Found" },
  tenderSummary:      { type: String, default: "Not Found" },
  tenderDescription:  { type: String, default: "Not Found" },
  corrigendum:        { type: String, default: "Not Found" },
  purchaserAddress:   { type: String, default: "Not Found" },
  email:              { type: String, default: "Not Found" },
  website:            { type: String, default: "Not Found" },
});

const ScanHistorySchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      default: () => `batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    },
    totalFiles:         { type: Number, required: true },
    highRelevanceCount: { type: Number, default: 0 },
    possibleCount:      { type: Number, default: 0 },
    noRelevanceCount:   { type: Number, default: 0 },
    errorCount:         { type: Number, default: 0 },
    results:            [DocumentResultSchema],
  },
  {
    timestamps: { createdAt: "scannedAt", updatedAt: false },
  }
);

module.exports = mongoose.model("ScanHistory", ScanHistorySchema);
