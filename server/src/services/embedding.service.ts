import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type EmbeddingTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export const generateEmbedding = async (
  text: string,
  taskType: EmbeddingTask = "RETRIEVAL_DOCUMENT"
): Promise<number[]> => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      taskType,
      outputDimensionality: 768,
    },
  });

  const values = response.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Failed to generate embedding");
  }

  return values;
};