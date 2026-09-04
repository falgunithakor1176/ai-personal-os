import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";

export const extractTextFromDocument = async (
  storagePath: string,
  mimeType: string
): Promise<string> => {
  const fileBuffer = await fs.readFile(storagePath);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: fileBuffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    return fileBuffer.toString("utf-8");
  }

  throw new Error("Unsupported document type");
};