import api from "./api";

// USERS
export const getUsers = () => api.get("/admin/users");
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// REPAIRS
export const getAllRepairs = () => api.get("/admin/repairs");

// TECHNICIANS
export const getTechnicians = () => api.get("/admin/technicians");

// DASHBOARD
export const getDashboardStats = () => api.get("/admin/dashboard/stats");