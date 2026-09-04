import { Request, Response } from "express";
import { generateRagAnswer } from "../services/rag.service.js";

export const queryRag = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const result = await generateRagAnswer(
      question,
      req.userId!
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("RAG query error:", error);

    return res.status(500).json({
      message: "Failed to generate answer",
    });
  }
};