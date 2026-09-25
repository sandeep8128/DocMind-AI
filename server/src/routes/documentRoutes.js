const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  renameDocument,
  getDocumentStats,
} = require("../controllers/documentController");

// ==========================================
// GET USER DOCUMENTS
// GET /api/documents
// ==========================================
router.get("/", authMiddleware, getUserDocuments);

//document stats route

router.get("/stats", authMiddleware, getDocumentStats);

// ==========================================
// UPLOAD PDF DOCUMENT
// POST /api/documents/upload
// ==========================================
router.post(
  "/upload",
  authMiddleware,
  upload,
  uploadDocument,
);

// route delete
router.delete("/:documentId", authMiddleware, deleteDocument);

// remname route
router.put("/:documentId", authMiddleware, renameDocument);

router.get("/:documentId", authMiddleware, getDocumentById);

module.exports = router;
