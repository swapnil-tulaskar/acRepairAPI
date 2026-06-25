const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string()
    .length(10, "Mobile number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required")
});

const registerTechnicianSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string()
    .length(10, "Mobile number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  specialization: z.string().min(2, "Specialization is required"),
  experience: z.string().optional(),
  certifications: z.string().optional(),
  address: z.string().optional(),
  availability: z.string().optional(),
  about: z.string().optional()
});

module.exports = { 
  registerSchema, 
  loginSchema, 
  registerTechnicianSchema 
};