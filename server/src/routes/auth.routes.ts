import { Router } from "express";
import { register, resendVerification,  verifyEmail, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/resend-verification", resendVerification);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
export default router;