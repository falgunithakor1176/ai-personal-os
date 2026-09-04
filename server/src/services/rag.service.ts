import { GoogleGenAI } from "@google/genai";
import { searchSimilarChunks } from "./vector-search.service.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateRagAnswer = async (
  question: string,
  userId: string
) => {
  // 1. Retrieve relevant chunks
  const chunks = await searchSimilarChunks(question, userId, 5);

  if (chunks.length === 0) {
    return {
      answer: "I couldn't find relevant information in your documents.",
      sources: [],
    };
  }

  // 2. Build context
  const context = chunks
    .map(
      (chunk: any, index: number) =>
        `[Source ${index + 1}]\n${chunk.content}`
    )
    .join("\n\n");

  // 3. Ask Gemini using retrieved context
  const prompt = `
You are an AI assistant for a personal knowledge system.

Answer the user's question using ONLY the information provided
in the context below.

If the answer cannot be found in the context, say:
"I couldn't find that information in your documents."

Do not invent or assume information.

Context:
${context}

User Question:
${question}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return {
    answer: response.text,
    sources: chunks.map((chunk: any) => ({
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      similarity: chunk.similarity,
      content: chunk.content,
    })),
  };
};