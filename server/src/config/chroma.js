const { ChromaClient } = require("chromadb");

const host = process.env.CHROMA_HOST || "localhost";
const port = Number(process.env.CHROMA_PORT) || 8001;
const ssl = process.env.CHROMA_SSL === "true";

const client = new ChromaClient({
  host,
  port,
  ssl,
});

module.exports = client;