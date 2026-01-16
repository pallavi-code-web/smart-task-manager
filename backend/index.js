import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import sendEmail from "./utils/sendEmail.js";

dotenv.config();

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(
  cors({
    origin: "*", // frontend (Netlify / localhost)
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.send("✅ SmartTask API is running");
});

/* ======================
   TEST EMAIL ROUTE 🔥
====================== */
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "dappupallavi91@gmail.com", // 🔁 YOUR EMAIL
      subject: "Brevo SMTP Test",
      text: "🎉 If you got this email, SMTP is working!",
    });

    res.send("✅ Test email sent successfully");
  } catch (error) {
    console.error("❌ Test email failed:", error.message);
    res.status(500).send("❌ Email failed");
  }
});

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

/* ======================
   DATABASE + SERVER
====================== */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
