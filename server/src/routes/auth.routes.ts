import { Router } from "express";
import {
    register, resendVerification, verifyEmail, login, forgotPassword, resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/resend-verification", resendVerification);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
export default router;