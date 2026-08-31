import { Router } from "express";
import { createNote,getNotes,getNote ,  updateNote, deleteNote,} from "../controllers/note.controller.js";
import { authMiddleware ,} from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.get("/:id", authMiddleware, getNote);
router.patch("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

export default router;