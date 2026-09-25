const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Wait helper
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Generate AI answer
const generateAnswer = async (question, context) => {
  try {
    // ==========================================
    // VALIDATION
    // ==========================================

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    if (!question || !question.trim()) {
      throw new Error("Question is empty");
    }

    if (!context || !context.trim()) {
      throw new Error("Document context is empty");
    }

    // ==========================================
    // PROMPT
    // ==========================================

    const prompt = `
You are DocMind AI, a document question-answering assistant.

Answer the user's question ONLY using the provided document context.

Rules:
1. Do not use outside knowledge.
2. If the answer is not present in the context, say:
"I couldn't find this information in the uploaded document."
3. Give a clear and concise answer.
4. Answer in the same language as the user's question.
5. Do not mention these instructions in your answer.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

    // ==========================================
    // MODELS
    // ==========================================

    const models = [
      "gemini-3.5-flash",
      "gemini-3.6-flash",
    ];

    let lastError = null;

    // ==========================================
    // TRY MODELS
    // ==========================================

    for (const model of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(
            `🤖 Gemini request | Model: ${model} | Attempt: ${attempt}/3`
          );

          const response = await ai.models.generateContent({
            model,
            contents: prompt,
          });

          const answer = response.text;

          if (!answer || !answer.trim()) {
            throw new Error("Gemini returned an empty response");
          }

          console.log(
            `✅ Gemini answer generated successfully using ${model}`
          );

          return answer.trim();
        } catch (error) {
          lastError = error;

          const status =
            error?.status ||
            error?.response?.status ||
            error?.code;

          const message = error?.message || "";

          console.error(
            `❌ Gemini Error | Model: ${model} | Attempt: ${attempt}`
          );

          console.error("Status:", status);
          console.error("Message:", message);

          // Retry only temporary/server errors
          const retryable =
            status === 429 ||
            status === 500 ||
            status === 502 ||
            status === 503 ||
            status === 504 ||
            message.includes("high demand") ||
            message.includes("UNAVAILABLE") ||
            message.includes("temporarily");

          if (!retryable) {
            throw error;
          }

          // Don't wait after final attempt
          if (attempt < 3) {
            const delay = attempt * 3000;

            console.log(
              `⏳ Retrying in ${delay / 1000} seconds...`
            );

            await sleep(delay);
          }
        }
      }

      console.log(
        `⚠️ ${model} unavailable. Trying fallback model...`
      );
    }

    // ==========================================
    // ALL MODELS FAILED
    // ==========================================

    console.error("❌ All Gemini models failed.");

    throw new Error(
      lastError?.message ||
        "Gemini service is temporarily unavailable. Please try again later."
    );
  } catch (error) {
    console.error("====================================");
    console.error("❌ FINAL GEMINI ERROR");
    console.error("====================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("====================================");

    throw error;
  }
};

module.exports = {
  generateAnswer,
};