import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function createNote(req: Request, res: Response) {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content,
        userId: req.userId,
      },
    });

    return res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getNotes(req: Request, res: Response) {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getNote(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    return res.status(200).json({
      note,
    });
  } catch (error) {
    console.error("Get note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateNote(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { title, content } = req.body;

    if (title === undefined && content === undefined) {
      return res.status(400).json({
        message: "At least title or content is required",
      });
    }

    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const data: {
      title?: string;
      content?: string;
    } = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      data.title = title.trim();
    }

    if (content !== undefined) {
      data.content = content;
    }

    const note = await prisma.note.update({
      where: {
        id,
      },
      data,
    });

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Update note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


export async function deleteNote(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await prisma.note.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}