/**
 * historyRoutes.js — Express Router for scan history API endpoints.
 */

const express = require("express");
const router  = express.Router();
const { getHistory, clearHistory, deleteHistoryBatch } = require("../controllers/historyController");

router.get("/history", getHistory);
router.delete("/history", clearHistory);
router.delete("/history/:id", deleteHistoryBatch);

module.exports = router;
