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
  if (err.name === "ZodError" || err.issues || err.errors) {
    // Get the errors array
    let errorList = err.errors || err.issues || [];
    
    // If errors is a string, it's already been stringified - parse it
    if (typeof errorList === 'string') {
      try {
        errorList = JSON.parse(errorList);
      } catch (e) {
        // If parsing fails, use it as a single error
        errorList = [{ message: errorList }];
      }
    }
    
    // Check if errorList is an array of objects or a string
    let formattedErrors = [];
    
    if (Array.isArray(errorList)) {
      formattedErrors = errorList.map((e) => {
        // If e is a string, treat it as a message
        if (typeof e === 'string') {
          return { message: e };
        }
        
        // If e is an object with path and message
        return {
          field: e.path ? (Array.isArray(e.path) ? e.path.join(".") : e.path) : "unknown",
          message: e.message || "Validation error",
          code: e.code || "invalid"
        };
      });
    } else if (typeof errorList === 'object' && errorList !== null) {
      // If it's a single error object
      formattedErrors = [{
        field: errorList.path ? (Array.isArray(errorList.path) ? errorList.path.join(".") : errorList.path) : "unknown",
        message: errorList.message || "Validation error",
        code: errorList.code || "invalid"
      }];
    } else {
      formattedErrors = [{ message: "Validation error" }];
    }
    
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: formattedErrors
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