import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROOT TEST
app.get("/", (req, res) => {
  res.send("API Running");
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// DB + SERVER
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((err) => {
    console.log("Mongo error:", err.message);
  });
