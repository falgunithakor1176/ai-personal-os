import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { extractTextFromDocument } from "../services/document-extraction.service.js";
import { chunkText } from "../services/chunking.service.js";
import { generateEmbedding } from "../services/embedding.service.js";


export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.status(200).json({
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await prisma.document.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  console.log("UPLOAD CONTROLLER HIT");

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const document = await prisma.document.create({
      data: {
        userId: req.userId!,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath: req.file.path,
      },
    });

    console.log("Starting text extraction...");

    const extractedText = await extractTextFromDocument(
      document.storagePath,
      document.mimeType
    );

    console.log("Extraction completed");
    console.log("Extracted text length:", extractedText.length);

    const chunks = chunkText(extractedText);

    console.log("Number of chunks:", chunks.length);

    // Create chunks first
    await prisma.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId: document.id,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
      })),
    });

    console.log("Document chunks created");

    // Generate and store embeddings
    console.log("Generating embeddings...");

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      await prisma.$executeRaw`
        UPDATE "DocumentChunk"
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE "documentId" = ${document.id}
        AND "chunkIndex" = ${chunk.chunkIndex}
      `;
    }

    console.log("Embeddings generated and stored");

    const updatedDocument = await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        extractedText,
      },
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};