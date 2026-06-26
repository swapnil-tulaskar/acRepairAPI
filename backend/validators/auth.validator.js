const { z } = require("zod");

// ================= USER REGISTER =================
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string()
    .length(10, "Mobile number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number")
});

// ================= LOGIN =================
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// ================= TECHNICIAN APPLICATION =================
const registerTechnicianSchema = z.object({
  specialization: z.string().min(2, "Specialization is required"),
  experience: z.string().optional(),
  certifications: z.string().optional(),
  address: z.string().optional(),
  availability: z.enum([
    "available",
    "part-time",
    "full-time",
    "on-call",
    "not-available"
  ]).optional(),
  about: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  registerTechnicianSchema
};