const { generateEmbedding } = require("../services/embeddingService");

const { searchEmbedding } = require("../services/vectorService");

const { generateAnswer } = require("../services/chatService");

const Document = require("../models/Document");
const Chat = require("../models/Chat");

// ==========================================
// GET CHAT HISTORY
// ==========================================

const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    // ------------------------------------------
    // 1. Check documentId
    // ------------------------------------------

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    // ------------------------------------------
    // 2. Check document belongs to user
    // ------------------------------------------

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

    // ------------------------------------------
    // 3. Get chat history
    // ------------------------------------------

    const chats = await Chat.find({
      user: req.user.id,
      document: documentId,
    })
      .sort({ createdAt: 1 })
      .select("question answer retrievedChunks createdAt updatedAt");

    // ------------------------------------------
    // 4. Response
    // ------------------------------------------

    return res.status(200).json({
      success: true,

      document: {
        id: document._id,
        fileName: document.fileName,
      },

      chats,
    });
  } catch (error) {
    console.error("❌ Chat History Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CHAT WITH DOCUMENT
// ==========================================

const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    // ------------------------------------------
    // 1. Validate question
    // ------------------------------------------

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // ------------------------------------------
    // 2. Validate documentId
    // ------------------------------------------

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    // ------------------------------------------
    // 3. Check document belongs to user
    // ------------------------------------------

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

    // ------------------------------------------
    // 4. Generate question embedding
    // ------------------------------------------

    console.log("Generating question embedding...");

    const embedding = await generateEmbedding(question.trim());

    // ------------------------------------------
    // 5. Search ONLY selected document
    // ------------------------------------------

    console.log("Searching ChromaDB for document:", documentId);

    const result = await searchEmbedding(embedding, 5, documentId);

    // ------------------------------------------
    // 6. Get retrieved data
    // ------------------------------------------

    const documents = result.documents?.[0] || [];

    const metadatas = result.metadatas?.[0] || [];

    const distances = result.distances?.[0] || [];

    // ------------------------------------------
    // 7. No relevant chunks
    // ------------------------------------------

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No relevant information found in this document",
      });
    }

    // ------------------------------------------
    // 8. Build context
    // ------------------------------------------

    const context = documents.join("\n\n---\n\n");

    // ------------------------------------------
    // 9. Generate AI answer
    // ------------------------------------------

    console.log("Generating AI answer...");

    const answer = await generateAnswer(question.trim(), context);

    // ------------------------------------------
    // 10. Build sources
    // ------------------------------------------

    const sources = documents.map((text, index) => ({
      text,

      documentId: metadatas[index]?.documentId || documentId,

      fileName: metadatas[index]?.fileName || document.fileName,

      chunkIndex: metadatas[index]?.chunkIndex ?? index,

      distance: distances[index] ?? null,
    }));

    // ------------------------------------------
    // 11. SAVE CHAT TO MONGODB
    // ------------------------------------------

    console.log("Saving chat to MongoDB...");

    const chat = await Chat.create({
      user: req.user.id,

      document: documentId,

      question: question.trim(),

      answer: answer.trim(),

      retrievedChunks: documents,

      sources: sources,
    });

    console.log("✅ Chat saved:", chat._id.toString());

    // ------------------------------------------
    // 12. Final response
    // ------------------------------------------

    return res.status(200).json({
      success: true,

      chatId: chat._id,

      question: question.trim(),

      answer: answer.trim(),

      document: {
        id: document._id,
        fileName: document.fileName,
      },

      retrievedChunks: documents,

      sources,
    });
  } catch (error) {
    console.error("❌ Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getChatStats = async (req, res) => {
  try {
    // Total documents
    const documents = await Document.countDocuments({
      user: req.user.id,
    });

    // Total questions
    const questionsAsked = await Chat.countDocuments({
      user: req.user.id,
    });

    // Total storage
    const storageResult = await Document.aggregate([
      {
        $match: {
          user: req.user.id,
        },
      },
      {
        $group: {
          _id: null,
          totalSize: {
            $sum: {
              $ifNull: ["$fileSize", 0],
            },
          },
        },
      },
    ]);

    const totalStorage =
      storageResult.length > 0 ? storageResult[0].totalSize : 0;

    const storageUsedMB = (totalStorage / (1024 * 1024)).toFixed(2);

    return res.status(200).json({
      success: true,
      stats: {
        documents,
        questionsAsked,
        storageUsed: storageUsedMB,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  chatWithDocument,
  getChatHistory,
  getChatStats,
};
