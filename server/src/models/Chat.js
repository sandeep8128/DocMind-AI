const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // Logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Document
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    // User question
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // AI answer
    answer: {
      type: String,
      required: true,
    },

    // Retrieved chunks
    retrievedChunks: {
      type: [String],
      default: [],
    },

    // Sources used for generating answer
    sources: [
      {
        text: {
          type: String,
          default: "",
        },

        documentId: {
          type: String,
          default: "",
        },

        fileName: {
          type: String,
          default: "",
        },

        chunkIndex: {
          type: Number,
          default: 0,
        },

        distance: {
          type: Number,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Chat",
  chatSchema
);