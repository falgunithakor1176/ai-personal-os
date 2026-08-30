import argon2 from "argon2";
import crypto from "node:crypto";
import prisma from "../config/prisma.js";

const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function createVerificationChallenge(userId: string) {
  const otp = generateOtp();

  const otpHash = await argon2.hash(otp);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await prisma.emailVerification.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.emailVerification.create({
    data: {
      userId,
      otpHash,
      expiresAt,
    },
  });

  return otp;
}