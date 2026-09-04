import prisma from "../config/prisma.js";
import { generateEmbedding } from "./embedding.service.js";

export interface SearchResult {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export const searchSimilarChunks = async (
  query: string,
  userId: string,
  limit: number = 5
): Promise<SearchResult[]> => {
  const queryEmbedding = await generateEmbedding(
    query,
    "RETRIEVAL_QUERY"
  );

  const vector = `[${queryEmbedding.join(",")}]`;

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      dc.id,
      dc."documentId",
      dc."chunkIndex",
      dc.content,
      1 - (dc.embedding <=> ${vector}::vector) AS similarity
    FROM "DocumentChunk" dc
    INNER JOIN "Document" d
      ON d.id = dc."documentId"
    WHERE d."userId" = ${userId}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> ${vector}::vector
    LIMIT ${limit};
  `;

  return results;
};