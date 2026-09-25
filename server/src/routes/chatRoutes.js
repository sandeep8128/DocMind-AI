const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  chatWithDocument,
  getChatHistory,
  getChatStats,
} = require("../controllers/chatController");

// ==========================================
// DASHBOARD STATS
// ==========================================

router.get(
  "/stats",
  authMiddleware,
  getChatStats
);

// ==========================================
// CHAT WITH DOCUMENT
// ==========================================

router.post(
  "/",
  authMiddleware,
  chatWithDocument
);

// ==========================================
// CHAT HISTORY
// ==========================================

router.get(
  "/:documentId/history",
  authMiddleware,
  getChatHistory
);

module.exports = router;