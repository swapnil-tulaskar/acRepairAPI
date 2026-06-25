const express = require("express");
const { register, login, registerTechnician } = require("../controllers/auth.controller.js");
const { validate } = require("../middleware/validate.middleware.js");
const { registerSchema, loginSchema, registerTechnicianSchema } = require("../validators/auth.validator.js");

const router = express.Router();

console.log("🔐 Auth routes loading...");
console.log("registerTechnician:", typeof registerTechnician);
console.log("validate:", typeof validate);
console.log("registerTechnicianSchema:", typeof registerTechnicianSchema);

router.post("/register", validate(registerSchema), register);
router.post("/register-technician", validate(registerTechnicianSchema), registerTechnician);
router.post("/login", validate(loginSchema), login);

console.log("✅ Auth routes loaded");

module.exports = router;