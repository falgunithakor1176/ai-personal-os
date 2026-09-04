import { Router } from "express";
import { queryRag } from "../controllers/rag.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/query", authMiddleware, queryRag);

export default router;