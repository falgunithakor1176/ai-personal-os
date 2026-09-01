import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function createTask(req: Request, res: Response) {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        const allowedStatuses = ["pending", "in_progress", "completed"];
        const allowedPriorities = ["low", "medium", "high"];

        if (
            !title ||
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "Title is required",
            });
        }

        if (
            status !== undefined &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        if (
            priority !== undefined &&
            !allowedPriorities.includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }

        let parsedDueDate: Date | null = null;

        if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
            parsedDueDate = new Date(dueDate);

            if (Number.isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid due date",
                });
            }
        }

        const task = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description ?? null,
                status: status ?? "pending",
                priority: priority ?? "medium",
                dueDate: parsedDueDate,
                userId: req.userId,
            },
        });

        return res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        console.error("Create task error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function getTasks(req: Request, res: Response) {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: req.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            tasks,
        });
    } catch (error) {
        console.error("Get tasks error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function getTask(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const task = await prisma.task.findFirst({
            where: {
                id,
                userId: req.userId,
            },
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        return res.status(200).json({
            task,
        });
    } catch (error) {
        console.error("Get task error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function updateTask(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const {
            title,
            description,
            status,
            priority,
            dueDate,
        } = req.body;
        const allowedStatuses = ["pending", "in_progress", "completed"];
        const allowedPriorities = ["low", "medium", "high"];

        if (
            status !== undefined &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        if (
            priority !== undefined &&
            !allowedPriorities.includes(priority)
        ) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }
        if (
            title === undefined &&
            description === undefined &&
            status === undefined &&
            priority === undefined &&
            dueDate === undefined
        ) {
            return res.status(400).json({
                message: "At least one field is required",
            });
        }

        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId: req.userId,
            },
        });

        if (!existingTask) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const data: {
            title?: string;
            description?: string | null;
            status?: string;
            priority?: string;
            dueDate?: Date | null;
        } = {};

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: "Title cannot be empty",
                });
            }

            data.title = title.trim();
        }

        if (description !== undefined) {
            data.description = description;
        }

        if (status !== undefined) {
            data.status = status;
        }

        if (priority !== undefined) {
            data.priority = priority;
        }

        if (dueDate !== undefined) {
            data.dueDate = dueDate ? new Date(dueDate) : null;
        }

        const task = await prisma.task.update({
            where: {
                id,
            },
            data,
        });

        return res.status(200).json({
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        console.error("Update task error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function deleteTask(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const existingTask = await prisma.task.findFirst({
            where: {
                id,
                userId: req.userId,
            },
        });

        if (!existingTask) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        await prisma.task.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}