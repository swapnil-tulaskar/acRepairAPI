import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import UserDashboard from "../pages/user/UserDashboard";
import BookRepair from "../pages/user/BookRepair";
import MyRepairs from "../pages/user/MyRepairs";

import AdminDashboard from "../pages/admin/AdminDashboard";
import TechnicianDashboard from "../pages/technician/TechnicianDashboard";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute><BookRepair /></ProtectedRoute>} />
        <Route path="/my-repairs" element={<ProtectedRoute><MyRepairs /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* TECHNICIAN */}
        <Route path="/tech" element={<ProtectedRoute><TechnicianDashboard /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;