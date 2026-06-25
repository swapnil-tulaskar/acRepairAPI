const express = require("express");
const { protect } = require("../middleware/auth.middleware.js");
const { adminOnly } = require("../middleware/admin.middleware.js");

// Import admin controllers
const {
  getAllUsers,
  getAllRepairs,
  updateUserRole,
  deleteUser,
  assignTechnician,
  deleteAllRepairs,
  getDashboardStats,
  makeAdmin
} = require("../controllers/admin/admin.controller.js");

// Import technician management controllers
const {
  createTechnician,
  getAllTechnicians,
  updateTechnicianStatus,
  deleteTechnician
} = require("../controllers/admin/technician.manage.controller.js");

const router = express.Router();

// ALL ROUTES HERE REQUIRE ADMIN ACCESS
router.use(protect, adminOnly);

// ============ DASHBOARD ============
router.get("/dashboard/stats", getDashboardStats);

// ============ USER MANAGEMENT ============
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.patch("/update-role", updateUserRole);
router.patch("/make-admin", makeAdmin);

// ============ REPAIR MANAGEMENT ============
router.get("/repairs", getAllRepairs);
router.delete("/repairs/all", deleteAllRepairs);
router.post("/assign-repair", assignTechnician);

// ============ TECHNICIAN MANAGEMENT ============
router.post("/technicians", createTechnician);
router.get("/technicians", getAllTechnicians);
router.patch("/technicians/:id/status", updateTechnicianStatus);
router.delete("/technicians/:id", deleteTechnician);

module.exports = router;