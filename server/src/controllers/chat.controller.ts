import { Request, Response } from "express";
import { processChatMessage } from "../services/chat.service.js";

export const sendChatMessage = async (
  req: Request,
  res: Response
) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const result = await processChatMessage({
      userId: req.userId!,
      message,
      sessionId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      message: "Failed to process chat message",
    });
  }
};