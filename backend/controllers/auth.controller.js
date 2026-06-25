const User = require("../models/User.js");
const TechnicianApplication = require("../models/TechnicianApplication.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema, registerTechnicianSchema } = require("../validators/auth.validator.js");
const { ZodError } = require("zod");

// ==================== USER REGISTRATION (No Approval) =================
const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, phone } = validatedData;

    console.log("📝 Registering user:", email);

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);

      if (existingUser.email === email && existingUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "This email and phone number are already registered. Please login or use different credentials.",
          field: "both"
        });
      } else if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered. Please login or use a different email.",
          field: "email"
        });
      } else if (existingUser.phone === phone) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already registered. Please login or use a different phone number.",
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
      { id: user._id, role: user.role },
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
      const value = err.keyValue[field];

      let message = `${field} already exists`;
      let fieldName = field;

      if (field === "email") {
        message = `Email "${value}" is already registered. Please login or use a different email.`;
        fieldName = "email";
      } else if (field === "phone") {
        message = `Phone number "${value}" is already registered. Please login or use a different phone number.`;
        fieldName = "phone";
      }

      return res.status(409).json({
        success: false,
        message,
        field: fieldName,
        value
      });
    }

    console.error("❌ Error in register:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ==================== TECHNICIAN REGISTRATION (Requires Approval) =================
const registerTechnician = async (req, res) => {
  console.log("📝 registerTechnician called");
  console.log("Request body:", req.body);

  try {
    // Use the schema for validation
    const validatedData = registerTechnicianSchema.parse(req.body);
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      certifications,
      address,
      availability,
      about
    } = validatedData;

    console.log("Checking if user exists...");
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      console.log("❌ User already exists");

      let message = "User already exists";
      let field = "both";

      if (existingUser.email === email && existingUser.phone === phone) {
        message = "This email and phone number are already registered. Please login or use different credentials.";
        field = "both";
      } else if (existingUser.email === email) {
        message = "This email is already registered. Please login or use a different email.";
        field = "email";
      } else if (existingUser.phone === phone) {
        message = "This phone number is already registered. Please login or use a different phone number.";
        field = "phone";
      }

      return res.status(409).json({
        success: false,
        message,
        field
      });
    }

    console.log("Checking for pending application...");
    const existingApplication = await TechnicianApplication.findOne({
      email,
      status: "pending"
    });

    if (existingApplication) {
      console.log("❌ Pending application exists");
      return res.status(409).json({
        success: false,
        message: "You already have a pending application. Please wait for admin approval."
      });
    }

    console.log("Checking for rejected application...");
    const rejectedApplication = await TechnicianApplication.findOne({
      email,
      status: "rejected"
    });

    if (rejectedApplication) {
      console.log("❌ Previously rejected application");
      return res.status(403).json({
        success: false,
        message: "Your previous application was rejected. Please contact admin for more information."
      });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    console.log("Creating technician application...");
    const application = await TechnicianApplication.create({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      experience: experience || "",
      certifications: certifications || "",
      address: address || "",
      availability: availability || "available",
      about: about || "",
      status: "pending"
    });

    console.log("✅ Technician application created successfully");
    console.log("Application ID:", application._id);

    return res.status(201).json({
      success: true,
      message: "Technician application submitted successfully. Please wait for admin approval.",
      data: {
        id: application._id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        status: application.status,
        submittedAt: application.createdAt
      }
    });

  } catch (err) {
    // Handle Zod validation errors
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

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];

      let message = `${field} already exists`;
      let fieldName = field;

      if (field === "email") {
        message = `Email "${value}" is already registered. Please use a different email.`;
        fieldName = "email";
      } else if (field === "phone") {
        message = `Phone number "${value}" is already registered. Please use a different phone number.`;
        fieldName = "phone";
      }

      return res.status(409).json({
        success: false,
        message,
        field: fieldName,
        value
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

// ==================== LOGIN (For All Users) =================
const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    console.log("📝 Login attempt:", email);

    let user = await User.findOne({ email }).select("+password");
    let isNewTechnician = false;

    if (!user) {
      console.log("User not found, checking technician applications...");
      const application = await TechnicianApplication.findOne({
        email,
        status: "approved"
      });

      if (application) {
        console.log("Found approved application, creating user from approved technician application...");

        // Check if user already exists (double-check)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          user = existingUser;
        } else {
          // Use the already hashed password from the application
          user = await User.create({
            name: application.name,
            email: application.email,
            password: application.password, // Already hashed
            phone: application.phone,
            role: "technician",
            specialization: application.specialization,
            isActive: true,
            assignedJobs: []
          });
          isNewTechnician = true;
          console.log("✅ Technician user created from application");
        }
      } else {
        console.log("❌ No user or approved application found");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
    }

    // Check if user account is active
    if (!user.isActive) {
      console.log("❌ User is deactivated");
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact admin."
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare response (remove password)
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("✅ Login successful:", email);

    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: isNewTechnician
        ? "Login successful! Your technician account is now active."
        : "Login successful"
    });

  } catch (err) {
    // Handle Zod validation errors
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
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

module.exports = {
  register,
  registerTechnician,
  login
};