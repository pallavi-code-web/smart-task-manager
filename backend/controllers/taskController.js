import Task from "../models/Task.js";

// GET all tasks for logged-in user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE new task
export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      priority: req.body.priority || "Medium",
      category: req.body.category || "General",
      dueDate: req.body.dueDate,
      user: req.user.id,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE completed
export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
