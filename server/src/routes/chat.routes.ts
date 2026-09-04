import { Router } from "express";

import { sendChatMessage } from "../controllers/chat.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/message", authMiddleware, sendChatMessage);

export default router;