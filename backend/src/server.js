import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import postRoutes from "./routes/postRoutes.js"

import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.set('trust proxy', true);

const __dirname = path.resolve();

app.use(
  cors({
    //,origin: "http://localhost:5173"
    origin: "https://nworkstreamfrontend.vercel.app",
    credentials: true, // allow frontend to send cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/post", postRoutes);

{/* if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
} */}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
