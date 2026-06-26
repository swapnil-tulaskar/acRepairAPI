const User = require("../models/User.js");
const TechnicianApplication = require("../models/TechnicianApplication.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema, registerTechnicianSchema } = require("../validators/auth.validator.js");
const { ZodError } = require("zod");

// ==================== USER REGISTRATION =================
const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, phone } = validatedData;

    console.log("📝 Registering user:", email);

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email && existingUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "This email and phone number are already registered.",
          field: "both"
        });
      } else if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered.",
          field: "email"
        });
      } else if (existingUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already registered.",
          field: "phone"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user"
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User registered successfully:", email);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: userResponse
    });

  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }));

      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        field
      });
    }

    console.error("❌ Error in register:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==================== TECHNICIAN APPLICATION =================
const registerTechnician = async (req, res) => {
  console.log("📝 registerTechnician called");
  console.log("User ID:", req.user.id);
  console.log("Request body:", req.body);

  try {
    const validatedData = registerTechnicianSchema.parse(req.body);
    console.log("✅ Validation passed:", validatedData);

    const {
      specialization,
      experience,
      certifications,
      address,
      availability,
      about
    } = validatedData;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      console.log("❌ User not found:", req.user.id);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ User found:", user.email);
    console.log("User has password:", !!user.password);

    let userPassword = user.password;
    if (!userPassword) {
      console.log("⚠️ User password is missing, generating temp password");
      userPassword = await bcrypt.hash("temporary123", 10);
    }

    const existingApplication = await TechnicianApplication.findOne({
      email: user.email
    });

    if (existingApplication) {
      console.log("Existing application found:", existingApplication.status);

      if (existingApplication.status === "pending") {
        return res.status(409).json({
          success: false,
          message: "You already have a pending application. Please wait for admin approval.",
          status: "pending"
        });
      }

      if (existingApplication.status === "approved") {
        return res.status(409).json({
          success: false,
          message: "You are already an approved technician.",
          status: "approved"
        });
      }

      if (existingApplication.status === "rejected") {
        existingApplication.specialization = specialization;
        existingApplication.experience = experience || "";
        existingApplication.certifications = certifications || "";
        existingApplication.address = address || "";
        existingApplication.availability = availability || "available";
        existingApplication.about = about || "";
        existingApplication.status = "pending";
        existingApplication.reviewedBy = null;
        existingApplication.reviewedAt = null;
        existingApplication.reviewNotes = null;
        await existingApplication.save();

        console.log("✅ Application resubmitted successfully");

        return res.status(200).json({
          success: true,
          message: "Application resubmitted successfully. Please wait for admin approval.",
          data: {
            id: existingApplication._id,
            name: existingApplication.name,
            email: existingApplication.email,
            status: existingApplication.status,
            submittedAt: existingApplication.createdAt
          }
        });
      }
    }

    console.log("Creating new application...");
    const applicationData = {
      userId: user._id,
      name: user.name,
      email: user.email,
      password: userPassword,
      phone: user.phone,
      specialization,
      experience: experience || "",
      certifications: certifications || "",
      address: address || "",
      availability: availability || "available",
      about: about || "",
      status: "pending"
    };

    console.log("Application data:", {
      ...applicationData,
      password: applicationData.password ? "HASHED_PASSWORD_SET" : "NO_PASSWORD"
    });

    const application = await TechnicianApplication.create(applicationData);

    console.log("✅ Technician application created successfully, ID:", application._id);

    return res.status(201).json({
      success: true,
      message: "Technician application submitted successfully. Please wait for admin approval.",
      data: {
        id: application._id,
        name: application.name,
        email: application.email,
        status: application.status,
        submittedAt: application.createdAt
      }
    });

  } catch (err) {
    if (err instanceof ZodError) {
      console.log("❌ Validation error:", err.errors);
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }));

      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    if (err.name === "ValidationError") {
      console.log("❌ Mongoose Validation Error:", err.errors);
      const errors = Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message
      }));

      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        field
      });
    }

    console.error("❌ Error in registerTechnician:", err);
    console.error("Stack:", err.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ==================== LOGIN =================
const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    console.log("📝 Login attempt:", email);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact admin."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    let applicationStatus = null;
    let rejectionReason = null;

    const application = await TechnicianApplication.findOne({
      email: user.email
    });

    if (application) {
      applicationStatus = application.status;
      if (application.status === "rejected") {
        rejectionReason = application.reviewNotes || "Application rejected";
      }
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("✅ Login successful:", email);

    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
      technicianStatus: applicationStatus,
      rejectionReason: rejectionReason,
      message: "Login successful"
    });

  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }));

      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    console.error("❌ Error in login:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==================== GET TECHNICIAN STATUS =================
const getTechnicianStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const application = await TechnicianApplication.findOne({
      email: user.email
    });

    if (!application) {
      return res.json({
        success: true,
        hasApplied: false,
        status: null,
        message: "You have not applied to become a technician yet."
      });
    }

    return res.json({
      success: true,
      hasApplied: true,
      status: application.status,
      rejectionReason: application.status === "rejected" ? application.reviewNotes : null,
      submittedAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      data: {
        specialization: application.specialization,
        experience: application.experience,
        certifications: application.certifications,
        address: application.address,
        availability: application.availability,
        about: application.about
      }
    });

  } catch (err) {
    console.error("❌ Error in getTechnicianStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==================== RESUBMIT TECHNICIAN APPLICATION =================
const resubmitTechnicianApplication = async (req, res) => {
  try {
    const validatedData = registerTechnicianSchema.parse(req.body);
    const {
      specialization,
      experience,
      certifications,
      address,
      availability,
      about
    } = validatedData;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const application = await TechnicianApplication.findOne({
      email: user.email
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found."
      });
    }

    if (application.status !== "rejected") {
      return res.status(400).json({
        success: false,
        message: `Cannot resubmit application with status: ${application.status}`
      });
    }

    application.specialization = specialization;
    application.experience = experience || "";
    application.certifications = certifications || "";
    application.address = address || "";
    application.availability = availability || "available";
    application.about = about || "";
    application.status = "pending";
    application.reviewedBy = null;
    application.reviewedAt = null;
    application.reviewNotes = null;
    await application.save();

    return res.json({
      success: true,
      message: "Application resubmitted successfully. Please wait for admin approval.",
      data: {
        id: application._id,
        status: application.status
      }
    });

  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }));

      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    console.error("❌ Error in resubmitTechnicianApplication:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  register,
  registerTechnician,
  login,
  getTechnicianStatus,
  resubmitTechnicianApplication
};