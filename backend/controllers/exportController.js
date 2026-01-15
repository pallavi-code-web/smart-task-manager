import ExcelJS from "exceljs";
import Task from "../models/Task.js";

export const exportTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tasks");

    sheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Completed", key: "completed", width: 15 },
      { header: "Due Date", key: "dueDate", width: 20 },
    ];

    tasks.forEach((task) => {
      sheet.addRow({
        title: task.title,
        priority: task.priority,
        category: task.category,
        completed: task.completed ? "Yes" : "No",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=tasks.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
