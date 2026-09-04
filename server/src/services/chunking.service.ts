export interface TextChunk {
  chunkIndex: number;
  content: string;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export const chunkText = (text: string): TextChunk[] => {
  const cleanedText = text.trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    let end = Math.min(start + CHUNK_SIZE, cleanedText.length);

    // Try to avoid cutting a word in half.
    if (end < cleanedText.length) {
      const lastSpace = cleanedText.lastIndexOf(" ", end);

      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const content = cleanedText.slice(start, end).trim();

    if (content) {
      chunks.push({
        chunkIndex,
        content,
      });

      chunkIndex++;
    }

    if (end >= cleanedText.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
};