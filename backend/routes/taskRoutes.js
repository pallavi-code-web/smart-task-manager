import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

console.log("🔥 TASK ROUTES FILE LOADED");

// =======================
// ✅ TEST ROUTE (NO AUTH)
// =======================
router.get("/test", (req, res) => {
  res.json({ message: "Tasks route working ✅" });
});

// =======================
// 🔐 CREATE TASK (AUTH)
// =======================
router.post("/", auth, async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const task = await Task.create({
      title,
      dueDate,
      user: req.user.id, // comes from auth middleware
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// 🔐 GET ALL TASKS (AUTH)
// =======================
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("FETCH ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// 🔐 UPDATE TASK (AUTH)
// =======================
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = req.body.title ?? task.title;
    task.completed = req.body.completed ?? task.completed;
    task.dueDate = req.body.dueDate ?? task.dueDate;

    await task.save();

    res.json(task);
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// 🔐 DELETE TASK (AUTH)
// =======================
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted ✅" });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
