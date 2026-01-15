import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function Dashboard() {
  const navigate = useNavigate();

  // =====================
  // STATE
  // =====================
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================
  // LOGOUT (useCallback FIX)
  // =====================
  const logout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  // =====================
  // FETCH TASKS (FIXED)
  // =====================
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // =====================
  // AUTH CHECK
  // =====================
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      logout();
    } else {
      fetchTasks();
    }
  }, [fetchTasks, logout]);

  // =====================
  // CREATE / UPDATE TASK
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing) {
      await API.put(`/tasks/${editingTask._id}`, {
        title,
        dueDate,
        priority,
        category,
      });
    } else {
      await API.post("/tasks", {
        title,
        dueDate,
        priority,
        category,
      });
    }

    resetForm();
    fetchTasks();
  };

  const resetForm = () => {
    setTitle("");
    setDueDate("");
    setPriority("Medium");
    setCategory("General");
    setIsEditing(false);
    setEditingTask(null);
  };

  // =====================
  // TASK ACTIONS
  // =====================
  const toggleTask = async (task) => {
    await API.put(`/tasks/${task._id}`, {
      completed: !task.completed,
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (window.confirm("Delete task?")) {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    }
  };

  // =====================
  // FILTER TASKS
  // =====================
  const filteredTasks = tasks.filter((task) => {
    const match = task.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "COMPLETED") return task.completed && match;
    if (filter === "PENDING") return !task.completed && match;
    if (filter === "HIGH") return task.priority === "High" && match;
    return match;
  });

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center px-12 py-8">
        <div>
          <h1 className="text-3xl font-bold">SmartTask ✨</h1>
          <p className="text-sm text-muted">Your personal execution engine</p>
        </div>
        <button onClick={logout} className="neon-btn px-6">
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 space-y-12">
        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Stat label="Total Tasks" value={tasks.length} />
          <Stat label="Pending" value={pending} />
          <Stat label="Completed" value={completed} />
        </div>

        {/* CREATE TASK */}
        <div className="glass p-8 space-y-6">
          <h2 className="text-xl font-semibold">Create Task</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="neon-input"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="date"
                className="neon-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <select
                className="neon-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <input
                className="neon-input"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <button className="neon-btn">
              {isEditing ? "Update Task" : "Add Task"}
            </button>
          </form>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex gap-4">
          <input
            className="neon-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="neon-input w-48"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="HIGH">High Priority</option>
          </select>
        </div>

        {/* TASK LIST */}
        <div className="glass p-6 space-y-3">
          {loading ? (
            <p>Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <p>No tasks found</p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center p-4 rounded-xl hover:bg-white/40"
              >
                <div onClick={() => toggleTask(task)} className="cursor-pointer">
                  <p
                    className={`font-medium ${
                      task.completed && "line-through opacity-50"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-muted">
                    {task.priority} • {task.category}
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingTask(task);
                      setTitle(task.title);
                      setPriority(task.priority);
                      setCategory(task.category);
                    }}
                    className="link-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

// =====================
// STAT COMPONENT
// =====================
function Stat({ label, value }) {
  return (
    <div className="glass p-6">
      <p className="text-sm text-muted">{label}</p>
      <h3 className="text-4xl font-bold mt-2">{value}</h3>
    </div>
  );
}
