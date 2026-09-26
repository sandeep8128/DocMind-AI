const { CloudClient } = require("chromadb");

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
});

let collection = null;

// ==========================================
// Get / Create Collection
// ==========================================

const getCollection = async () => {
  if (!collection) {
    collection = await client.getOrCreateCollection({
      name: "docmind_documents",
    });
  }

  return collection;
};

// ==========================================
// Store Embedding
// ==========================================

const storeEmbedding = async ({ id, embedding, document, metadata }) => {
  try {
    const collection = await getCollection();

    await collection.add({
      ids: [id],

      embeddings: [embedding],

      documents: [document],

      metadatas: [metadata],
    });

    return true;
  } catch (error) {
    console.error("Store Embedding Error:", error);

    throw error;
  }
};

// ==========================================
// Search Embedding
// ==========================================

const searchEmbedding = async (embedding, limit = 5, documentId = null) => {
  try {
    const collection = await getCollection();

    // ------------------------------------------
    // Build filter
    // ------------------------------------------

    let where = undefined;

    if (documentId) {
      where = {
        documentId: documentId.toString(),
      };
    }

    // ------------------------------------------
    // Search ChromaDB
    // ------------------------------------------

    const result = await collection.query({
      queryEmbeddings: [embedding],

      nResults: limit,

      ...(where && {
        where,
      }),

      include: ["documents", "metadatas", "distances"],
    });

    return result;
  } catch (error) {
    console.error("Search Embedding Error:", error);

    throw error;
  }
};

// ==========================================
// DELETE DOCUMENT EMBEDDINGS
// ==========================================

const deleteDocumentEmbeddings = async (documentId) => {
  try {
    const collection = await getCollection();

    await collection.delete({
      where: {
        documentId: documentId.toString(),
      },
    });

    console.log(`✅ ChromaDB embeddings deleted for document: ${documentId}`);

    return true;
  } catch (error) {
    console.error("ChromaDB Delete Error:", error);

    throw error;
  }
};

module.exports = {
  getCollection,
  storeEmbedding,
  searchEmbedding,
  deleteDocumentEmbeddings,
};
