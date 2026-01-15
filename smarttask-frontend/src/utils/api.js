import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-task-manager-1-mrvz.onrender.com/api",
});

// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
