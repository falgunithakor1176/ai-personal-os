import { Router } from "express";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createTask);

router.get("/", authMiddleware, getTasks);

router.get("/:id", authMiddleware, getTask);

router.patch("/:id", authMiddleware, updateTask);

router.delete("/:id", authMiddleware, deleteTask);
export default router;