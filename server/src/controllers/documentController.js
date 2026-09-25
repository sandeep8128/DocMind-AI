const fs = require("fs");
const pdfParse = require("pdf-parse");

const Document = require("../models/Document");
const Chat = require("../models/Chat");
const User = require("../models/User");

const {
  deleteDocumentEmbeddings,
  storeEmbedding,
} = require("../services/vectorService");

const { chunkText } = require("../services/chunkService");
const { generateEmbedding } = require("../services/embeddingService");

// ======================================================
// 🔴 FREE PLAN LIFETIME UPLOAD LIMIT
// ======================================================
// CHANGE THIS NUMBER LATER IF YOU WANT.
//
// 5 = Free user maximum 5 PDF uploads lifetime.
//
// IMPORTANT:
// - Upload count does NOT decrease when a PDF is deleted.
// - Pro users are not restricted by this limit.
// ======================================================

const FREE_UPLOAD_LIMIT = 5;

// ======================================================
// UPLOAD + PROCESS + INDEX DOCUMENT
// POST /api/documents/upload
// ======================================================

const uploadDocument = async (req, res) => {
  try {
    // ==================================================
    // 1. CHECK FILE
    // ==================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // ==================================================
    // 2. GET CURRENT USER
    // ==================================================

    const user = await User.findById(req.user.id);

    if (!user) {
      // Multer may already have saved the file.
      // Delete it because user doesn't exist.
      if (req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (fileError) {
          console.error(
            "Failed to delete uploaded file:",
            fileError.message
          );
        }
      }

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==================================================
    // 3. CHECK FREE PLAN LIFETIME UPLOAD LIMIT
    // ==================================================

    if (
      user.plan === "free" &&
      user.uploadCount >= FREE_UPLOAD_LIMIT
    ) {
      // Multer has already saved the PDF.
      // Delete rejected file so it does not remain
      // unnecessarily inside the uploads folder.

      if (req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);

          console.log(
            "🗑️ Rejected upload deleted because free limit was reached."
          );
        } catch (fileError) {
          console.error(
            "Failed to delete rejected upload:",
            fileError.message
          );
        }
      }

      return res.status(403).json({
        success: false,
        code: "UPLOAD_LIMIT_REACHED",
        message: `You have reached the free upload limit of ${FREE_UPLOAD_LIMIT} PDFs. Upgrade to Pro to upload more documents.`,
      });
    }

    // ==================================================
    // 4. READ UPLOADED PDF
    // ==================================================

    const dataBuffer = fs.readFileSync(req.file.path);

    // ==================================================
    // 5. EXTRACT PDF TEXT
    // ==================================================

    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData.text || !pdfData.text.trim()) {
      // Delete invalid/empty PDF
      if (req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (fileError) {
          console.error(
            "Failed to delete invalid PDF:",
            fileError.message
          );
        }
      }

      return res.status(400).json({
        success: false,
        message: "Could not extract text from this PDF",
      });
    }

    // ==================================================
    // 6. CREATE CHUNKS
    // ==================================================

    const chunks = chunkText(pdfData.text);

    console.log("====================================");
    console.log("📄 PDF INFORMATION");
    console.log("====================================");
    console.log("File:", req.file.originalname);
    console.log("Pages:", pdfData.numpages);
    console.log("File Size:", req.file.size, "bytes");
    console.log("Text Length:", pdfData.text.length);
    console.log("Total Chunks:", chunks.length);
    console.log("User Plan:", user.plan);
    console.log("Upload Count Before:", user.uploadCount);
    console.log("====================================");

    // ==================================================
    // 7. SAVE DOCUMENT IN MONGODB
    // ==================================================

    const document = await Document.create({
      user: req.user.id,

      fileName: req.file.originalname,

      filePath: req.file.path,

      fileSize: req.file.size,

      extractedText: pdfData.text,

      totalPages: pdfData.numpages,

      chunkCount: chunks.length,

      isIndexed: false,
    });

    console.log(
      "MongoDB Document Created:",
      document._id.toString()
    );

    // ==================================================
    // 8. GENERATE EMBEDDINGS
    // + STORE CHUNKS IN CHROMADB
    // ==================================================

    for (let i = 0; i < chunks.length; i++) {
      console.log(
        `Processing chunk ${i + 1}/${chunks.length}`
      );

      // Generate embedding
      const embedding = await generateEmbedding(chunks[i]);

      // Store vector
      await storeEmbedding({
        id: `${document._id}-${i}`,

        embedding,

        document: chunks[i],

        metadata: {
          documentId: document._id.toString(),

          userId: req.user.id.toString(),

          fileName: document.fileName,

          chunkIndex: i,
        },
      });
    }

    // ==================================================
    // 9. MARK DOCUMENT AS INDEXED
    // ==================================================

    document.isIndexed = true;

    await document.save();

    console.log("✅ Document Indexed Successfully");

    // ==================================================
    // 🔴 10. INCREASE SUCCESSFUL UPLOAD COUNT
    // ==================================================
    //
    // IMPORTANT:
    // Count is increased ONLY after:
    //
    // PDF extracted
    //      ↓
    // Chunks created
    //      ↓
    // Embeddings generated
    //      ↓
    // ChromaDB indexing completed
    //      ↓
    // Document marked indexed
    //
    // Therefore failed uploads do NOT consume a slot.
    // ==================================================

    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        uploadCount: 1,
      },
    });

    console.log("✅ Upload count increased");

    // ==================================================
    // 11. FINAL RESPONSE
    // ==================================================

    const newUploadCount = user.uploadCount + 1;

    return res.status(201).json({
      success: true,

      message: "PDF uploaded and indexed successfully",

      document: {
        id: document._id,

        fileName: document.fileName,

        pages: document.totalPages,

        fileSize: document.fileSize,

        fileSizeMB: Number(
          (
            document.fileSize /
            (1024 * 1024)
          ).toFixed(2)
        ),

        textLength: pdfData.text.length,

        chunks: chunks.length,

        indexed: document.isIndexed,
      },

      usage: {
        uploadCount: newUploadCount,

        maxUploads:
          user.plan === "free"
            ? FREE_UPLOAD_LIMIT
            : null,

        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("❌ Document Upload Error:", error);

    // ==================================================
    // CLEANUP UPLOADED FILE ON FAILURE
    // ==================================================

    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);

        console.log(
          "🗑️ Uploaded file cleaned up after error."
        );
      } catch (fileError) {
        console.error(
          "Failed to cleanup uploaded file:",
          fileError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Document upload failed",
    });
  }
};

// ======================================================
// GET USER DOCUMENTS
// GET /api/documents
// ======================================================

const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      user: req.user.id,
    })
      .sort({
        createdAt: -1,
      })
      .select(
        "_id fileName filePath fileSize totalPages chunkCount isIndexed createdAt updatedAt"
      );

    const documentsWithSize = documents.map((document) => {
      const doc = document.toObject();

      const fileSize = Number(doc.fileSize) || 0;

      return {
        ...doc,

        fileSize,

        fileSizeMB: Number(
          (fileSize / (1024 * 1024)).toFixed(2)
        ),
      };
    });

    return res.status(200).json({
      success: true,

      count: documentsWithSize.length,

      documents: documentsWithSize,
    });
  } catch (error) {
    console.error("❌ Get Documents Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch documents",
    });
  }
};

// ======================================================
// DELETE DOCUMENT
// DELETE /api/documents/:documentId
// ======================================================

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // ==================================================
    // 1. CHECK OWNERSHIP
    // ==================================================

    const document = await Document.findOne({
      _id: documentId,

      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,

        message: "Document not found or access denied",
      });
    }

    console.log(
      "Deleting document:",
      document.fileName
    );

    // ==================================================
    // 2. DELETE EMBEDDINGS
    // ==================================================

    await deleteDocumentEmbeddings(documentId);

    // ==================================================
    // 3. DELETE CHAT HISTORY
    // ==================================================

    await Chat.deleteMany({
      user: req.user.id,

      document: documentId,
    });

    // ==================================================
    // 4. DELETE PHYSICAL PDF
    // ==================================================

    if (
      document.filePath &&
      fs.existsSync(document.filePath)
    ) {
      try {
        fs.unlinkSync(document.filePath);

        console.log("✅ Physical PDF deleted");
      } catch (fileError) {
        console.log(
          "Could not delete physical file:",
          fileError.message
        );
      }
    }

    // ==================================================
    // 5. DELETE MONGODB DOCUMENT
    // ==================================================

    await Document.deleteOne({
      _id: documentId,
    });

    // ==================================================
    // ⚠️ IMPORTANT
    // ==================================================
    // DO NOT DECREASE user.uploadCount HERE.
    //
    // uploadCount is a LIFETIME upload counter.
    //
    // Example:
    // Upload 5 → count = 5
    // Delete 1 → count remains 5
    // 6th upload → blocked for Free user.
    // ==================================================

    console.log("✅ Document deleted successfully");

    return res.status(200).json({
      success: true,

      message: "Document deleted successfully",

      documentId,
    });
  } catch (error) {
    console.error(
      "Delete Document Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// RENAME DOCUMENT
// PUT /api/documents/:documentId
// ======================================================

const renameDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const { fileName } = req.body;

    // ==================================================
    // VALIDATE FILENAME
    // ==================================================

    if (!fileName || !fileName.trim()) {
      return res.status(400).json({
        success: false,

        message: "File name is required",
      });
    }

    // ==================================================
    // FIND DOCUMENT
    // ==================================================

    const document = await Document.findOne({
      _id: documentId,

      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,

        message: "Document not found or access denied",
      });
    }

    // ==================================================
    // RENAME
    // ==================================================

    document.fileName = fileName.trim();

    await document.save();

    console.log(
      "✅ Document renamed:",
      document.fileName
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message: "Document renamed successfully",

      document: {
        id: document._id,

        fileName: document.fileName,
      },
    });
  } catch (error) {
    console.error(
      "Rename Document Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// GET DOCUMENT STATS
// GET /api/documents/stats
// ======================================================

const getDocumentStats = async (req, res) => {
  try {
    // ==================================================
    // 1. TOTAL DOCUMENTS
    // ==================================================

    const documentsCount =
      await Document.countDocuments({
        user: req.user.id,
      });

    // ==================================================
    // 2. TOTAL QUESTIONS
    // ==================================================

    const questionsAsked =
      await Chat.countDocuments({
        user: req.user.id,
      });

    // ==================================================
    // 3. CALCULATE STORAGE
    // ==================================================

    const documents = await Document.find({
      user: req.user.id,
    }).select("fileSize filePath");

    let storageBytes = 0;

    for (const document of documents) {
      // First preference:
      // MongoDB stored fileSize

      if (
        document.fileSize &&
        Number(document.fileSize) > 0
      ) {
        storageBytes += Number(
          document.fileSize
        );

        continue;
      }

      // Fallback:
      // Check physical file

      try {
        if (
          document.filePath &&
          fs.existsSync(document.filePath)
        ) {
          const stats = fs.statSync(
            document.filePath
          );

          storageBytes += stats.size;
        }
      } catch (fileError) {
        console.log(
          "Could not read file:",
          document.filePath
        );
      }
    }

    // ==================================================
    // 4. BYTES → MB
    // ==================================================

    const storageUsed =
      storageBytes / (1024 * 1024);

    // ==================================================
    // 5. RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      stats: {
        documents: documentsCount,

        questionsAsked,

        storageUsed: Number(
          storageUsed.toFixed(2)
        ),

        storageBytes,
      },
    });
  } catch (error) {
    console.error(
      "Get Document Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE DOCUMENT
// GET /api/documents/:documentId
// ======================================================

const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,

        message: "Document ID is required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,

      user: req.user.id,
    }).select(
      "_id fileName filePath fileSize extractedText totalPages chunkCount isIndexed createdAt updatedAt"
    );

    if (!document) {
      return res.status(404).json({
        success: false,

        message:
          "Document not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,

      document,
    });
  } catch (error) {
    console.error(
      "Get Document By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  uploadDocument,

  getUserDocuments,

  getDocumentById,

  deleteDocument,

  renameDocument,

  getDocumentStats,
};