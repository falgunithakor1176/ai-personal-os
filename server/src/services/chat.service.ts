import prisma from "../config/prisma.js";
import { generateRagAnswer } from "./rag.service.js";

interface ChatInput {
  userId: string;
  message: string;
  sessionId?: string;
}

export const processChatMessage = async ({
  userId,
  message,
  sessionId,
}: ChatInput) => {
  // 1. Get existing session or create a new one
  let chatSession;

  if (sessionId) {
    chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!chatSession) {
      throw new Error("Chat session not found");
    }
  } else {
    chatSession = await prisma.chatSession.create({
      data: {
        userId,
        title: message.slice(0, 50),
      },
    });
  }

  // 2. Save user's message
  await prisma.chatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: "user",
      content: message,
    },
  });

  // 3. Generate AI answer using existing RAG pipeline
  const ragResult = await generateRagAnswer(message, userId);

// 4. Save AI response
if (!ragResult.answer) {
  throw new Error("RAG did not generate an answer");
}

await prisma.chatMessage.create({
  data: {
    sessionId: chatSession.id,
    role: "assistant",
    content: ragResult.answer,
  },
});

  // 5. Return response
  return {
    sessionId: chatSession.id,
    answer: ragResult.answer,
    sources: ragResult.sources,
  };
};