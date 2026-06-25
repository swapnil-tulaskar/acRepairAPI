const TechnicianApplication = require("../../models/TechnicianApplication.js");
const User = require("../../models/User.js");

// ==================== GET ALL APPLICATIONS =================
const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const applications = await TechnicianApplication.find(filter)
      .sort({ createdAt: -1 });

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === "pending").length,
      approved: applications.filter(a => a.status === "approved").length,
      rejected: applications.filter(a => a.status === "rejected").length
    };

    res.json({
      success: true,
      stats,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== GET SINGLE APPLICATION =================
const getApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await TechnicianApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== APPROVE APPLICATION =================
const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    // Find application
    const application = await TechnicianApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Application already approved"
      });
    }

    if (application.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Application was rejected. Cannot approve."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: application.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create technician from application
    const user = await User.create({
      name: application.name,
      email: application.email,
      password: application.password, // Already hashed
      phone: application.phone,
      role: "technician",
      specialization: application.specialization,
      isActive: true
    });

    // Update application
    application.status = "approved";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.reviewNotes = reviewNotes || "Application approved";
    await application.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Technician application approved successfully",
      data: {
        application: {
          id: application._id,
          status: application.status
        },
        technician: userResponse
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== REJECT APPLICATION =================
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    // Find application
    const application = await TechnicianApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Application is already approved. Cannot reject."
      });
    }

    if (application.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Application already rejected"
      });
    }

    // Update application
    application.status = "rejected";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.reviewNotes = reviewNotes || "Application rejected";
    await application.save();

    res.json({
      success: true,
      message: "Technician application rejected",
      data: {
        id: application._id,
        status: application.status,
        reviewNotes: application.reviewNotes
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  getAllApplications,
  getApplication,
  approveApplication,
  rejectApplication
};