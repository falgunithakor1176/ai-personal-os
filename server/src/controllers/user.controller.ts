import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function updateProfile(req: Request, res: Response) {
  try {
    const {
      username,
      bio,
      profileImage,
      phone,
      timezone,
      language,
      theme,
    } = req.body;

    // Username validation
    if (
      username !== undefined &&
      username !== null &&
      !/^[a-zA-Z0-9_]{3,30}$/.test(username)
    ) {
      return res.status(400).json({
        message:
          "Username must be 3-30 characters and contain only letters, numbers, and underscores",
      });
    }

    // Bio validation
    if (bio !== undefined && bio !== null && bio.length > 500) {
      return res.status(400).json({
        message: "Bio must be 500 characters or less",
      });
    }

    // Theme validation
    if (
      theme !== undefined &&
      !["light", "dark", "system"].includes(theme)
    ) {
      return res.status(400).json({
        message: "Theme must be light, dark, or system",
      });
    }

    // Language validation
    if (
      language !== undefined &&
      !/^[a-zA-Z]{2,5}$/.test(language)
    ) {
      return res.status(400).json({
        message: "Invalid language code",
      });
    }

    const data: {
      username?: string | null;
      bio?: string | null;
      profileImage?: string | null;
      phone?: string | null;
      timezone?: string;
      language?: string;
      theme?: string;
    } = {};

    // Only update fields that were actually provided
    if (username !== undefined) {
      data.username = username;
    }

    if (bio !== undefined) {
      data.bio = bio;
    }

    if (profileImage !== undefined) {
      data.profileImage = profileImage;
    }

    if (phone !== undefined) {
      data.phone = phone;
    }

    if (timezone !== undefined) {
      data.timezone = timezone;
    }

    if (language !== undefined) {
      data.language = language;
    }

    if (theme !== undefined) {
      data.theme = theme;
    }

    const profile = await prisma.userProfile.upsert({
      where: {
        userId: req.userId,
      },
      update: data,
      create: {
        userId: req.userId,
        username: username ?? null,
        bio: bio ?? null,
        profileImage: profileImage ?? null,
        phone: phone ?? null,
        timezone: timezone ?? "Asia/Kolkata",
        language: language ?? "en",
        theme: theme ?? "system",
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}