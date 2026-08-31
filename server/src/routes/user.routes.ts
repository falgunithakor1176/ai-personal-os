import { Router } from "express";
import { getMe,updateProfile, } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me/profile", authMiddleware, updateProfile);

export default router;