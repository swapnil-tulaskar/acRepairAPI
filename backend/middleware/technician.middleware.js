const TechnicianApplication = require("../models/TechnicianApplication.js");
const User = require("../models/User.js");

const technicianOnly = async (req, res, next) => {
  console.log("🔧 technicianOnly middleware called");
  console.log("User object:", req.user);
  
  if (!req.user) {
    console.log("❌ No user found");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Login required"
    });
  }

  if (req.user.role !== "technician") {
    console.log(`❌ Not a technician: ${req.user.role}`);
    return res.status(403).json({
      success: false,
      message: "Access denied: Technician only"
    });
  }

  // Check if technician application is approved
  try {
    // Get email from token or fetch from database
    let userEmail = req.user.email;
    console.log("Email from token:", userEmail);
    
    if (!userEmail) {
      console.log("❌ No email in token, fetching from database");
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      userEmail = user.email;
      req.user.email = userEmail;
    }

    console.log("Looking for application with email:", userEmail);

    const application = await TechnicianApplication.findOne({
      email: userEmail
    });

    console.log("Application found:", application ? "Yes" : "No");
    console.log("Application status:", application ? application.status : "N/A");

    if (!application) {
      console.log("❌ No technician application found");
      return res.status(403).json({
        success: false,
        message: "You have not applied to become a technician yet.",
        status: "not_applied"
      });
    }

    if (application.status !== "approved") {
      console.log(`❌ Technician application not approved: ${application.status}`);
      return res.status(403).json({
        success: false,
        message: `Your technician application is ${application.status}.`,
        status: application.status
      });
    }

    console.log("✅ technicianOnly middleware complete, calling next()");
    next();
  } catch (err) {
    console.error("❌ Error in technician middleware:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { technicianOnly };