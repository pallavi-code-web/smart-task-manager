import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE TASK ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { title, dueDate, priority, category } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title required" });
    }

    const task = await Task.create({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "Medium",
      category: category || "General",
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Task failed" });
  }
});

/* ================= GET TASKS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE TASK ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE TASK ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
