/**
 * historyController.js — API Handlers for scan history stored in MongoDB.
 */

const ScanHistory = require("../models/ScanHistory");
const { getDBStatus } = require("../db");

/**
 * GET /api/history
 * Fetch the latest 20 scan batches from MongoDB.
 */
async function getHistory(req, res) {
  try {
    const { connected } = getDBStatus();

    if (!connected) {
      return res.status(200).json({
        success: true,
        dbConnected: false,
        message: "MongoDB is not connected. Scan history is disabled.",
        history: [],
      });
    }

    const history = await ScanHistory.find()
      .sort({ scannedAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      dbConnected: true,
      count: history.length,
      history,
    });
  } catch (err) {
    console.error("[getHistory] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve scan history from MongoDB.",
    });
  }
}

/**
 * DELETE /api/history
 * Clear all scan history batches.
 */
async function clearHistory(req, res) {
  try {
    const { connected } = getDBStatus();

    if (!connected) {
      return res.status(400).json({
        success: false,
        message: "MongoDB is not connected.",
      });
    }

    await ScanHistory.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All scan history cleared successfully.",
    });
  } catch (err) {
    console.error("[clearHistory] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to clear scan history.",
    });
  }
}

/**
 * DELETE /api/history/:id
 * Delete a specific scan history batch by ID.
 */
async function deleteHistoryBatch(req, res) {
  try {
    const { connected } = getDBStatus();

    if (!connected) {
      return res.status(400).json({
        success: false,
        message: "MongoDB is not connected.",
      });
    }

    const { id } = req.params;
    await ScanHistory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Scan batch deleted.",
    });
  } catch (err) {
    console.error("[deleteHistoryBatch] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete scan batch.",
    });
  }
}

module.exports = { getHistory, clearHistory, deleteHistoryBatch };
