import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
import taskRoutes from "./routes/task.routes.js";
import documentRoutes from "./routes/document.routes.js";
import ragRoutes from "./routes/rag.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AI Personal OS API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/chat", chatRoutes);
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});