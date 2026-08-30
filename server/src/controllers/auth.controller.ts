import type { Request, Response } from "express";
import argon2 from "argon2";
import prisma from "../config/prisma.js";
import { createVerificationChallenge } from "../services/verification.service.js";
import { sendVerificationEmail } from "../services/email.service.js";

export async function register(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            if (!existingUser.emailVerified) {
                return res.status(409).json({
                    message: "An unverified account already exists for this email",
                });
            }

            return res.status(409).json({
                message: "An account already exists for this email",
            });
        }

        const passwordHash = await argon2.hash(password);

        const user = await prisma.user.create({

            data: {
                name: name.trim(),
                email: normalizedEmail,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });


        const otp = await createVerificationChallenge(user.id);

        await sendVerificationEmail(user.email, otp);

        return res.status(201).json({
            message: "User registered successfully",
            user,
        });


    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }

}

export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const otp = await createVerificationChallenge(user.id);

    await sendVerificationEmail(user.email, otp);

    return res.status(200).json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!verification) {
      return res.status(400).json({
        message: "No active verification challenge found",
      });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Verification code has expired",
      });
    }

    const isValidOtp = await argon2.verify(
      verification.otpHash,
      otp
    );

    if (!isValidOtp) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
      },
    });

    await prisma.emailVerification.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


