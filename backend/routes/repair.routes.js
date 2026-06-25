const express = require("express");
const {
  createRepair,
  getRepairs,
  deleteRepair,
  updateRepairStatus
} = require("../controllers/repair.controller.js");
const { protect } = require("../middleware/auth.middleware.js");
const { adminOnly } = require("../middleware/admin.middleware.js");
const { validate } = require("../middleware/validate.middleware.js");
const {
  createRepairSchema,
  updateStatusSchema
} = require("../validators/repair.validator.js");

const router = express.Router();

console.log("🔴 Repair routes loading...");

// Check if all functions exist
console.log("createRepair:", typeof createRepair);
console.log("getRepairs:", typeof getRepairs);
console.log("deleteRepair:", typeof deleteRepair);
console.log("updateRepairStatus:", typeof updateRepairStatus);
console.log("protect:", typeof protect);
console.log("adminOnly:", typeof adminOnly);
console.log("validate:", typeof validate);

// USER ROUTES
router.post("/", protect, validate(createRepairSchema), createRepair);
router.get("/my", protect, getRepairs);
router.delete("/:id", protect, deleteRepair);

// ADMIN ROUTES
router.patch("/:id/status", protect, adminOnly, validate(updateStatusSchema), updateRepairStatus);

console.log("✅ Repair routes loaded with GET /my");

module.exports = router;