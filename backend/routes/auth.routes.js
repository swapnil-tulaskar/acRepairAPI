const express = require("express");
const { 
  register, 
  login, 
  registerTechnician,
  getTechnicianStatus,
  resubmitTechnicianApplication
} = require("../controllers/auth.controller.js");
const { validate } = require("../middleware/validate.middleware.js");
const { protect } = require("../middleware/auth.middleware.js");
const { 
  registerSchema, 
  loginSchema, 
  registerTechnicianSchema 
} = require("../validators/auth.validator.js");

const router = express.Router();

console.log("🔐 Auth routes loading...");

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected routes (require login)
router.post("/register-technician", protect, validate(registerTechnicianSchema), registerTechnician);
router.get("/technician-status", protect, getTechnicianStatus);
router.put("/resubmit-technician", protect, validate(registerTechnicianSchema), resubmitTechnicianApplication);

console.log("✅ Auth routes loaded");

module.exports = router;