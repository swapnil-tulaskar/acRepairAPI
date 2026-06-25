const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Import routes
const authRoutes = require("./routes/auth.routes.js");
const repairRoutes = require("./routes/repair.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const technicianRoutes = require("./routes/technician.routes.js");
const adminTechnicianApplicationRoutes = require("./routes/admin.technician.application.routes.js");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/repair", repairRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/technician-applications", adminTechnicianApplicationRoutes);
app.use("/api/technician", technicianRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AC Repair Management API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      repair: "/api/repair",
      admin: "/api/admin",
      technician: "/api/technician"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ✅ FIXED: Global error handler with proper Zod support
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  
  // Handle Zod validation errors
  if (err.name === "ZodError" || err.issues) {
    // Get the errors array
    let errorList = err.errors;
    
    // If errors is a string, parse it
    if (typeof errorList === 'string') {
      try {
        errorList = JSON.parse(errorList);
      } catch (e) {
        // If parsing fails, use it as a single error
        errorList = [{ message: errorList }];
      }
    }
    
    // Format the errors
    const errors = Array.isArray(errorList) 
      ? errorList.map((e) => ({
          field: e.path ? e.path.join(".") : "unknown",
          message: e.message || "Validation error"
        }))
      : [{ message: "Validation error" }];
    
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors
    });
  }
  
  // Handle other errors
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📋 Test the API at: http://localhost:${PORT}/`);
    });
  })
  .catch(err => {
    console.log("❌ MongoDB Error:", err);
    process.exit(1);
  });