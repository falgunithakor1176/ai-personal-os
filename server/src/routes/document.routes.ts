import { Router } from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/document.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadDocument as upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

router.get("/", authMiddleware, getDocuments);
router.get("/:id", authMiddleware, getDocument);
router.delete("/:id", authMiddleware, deleteDocument);

export default router;