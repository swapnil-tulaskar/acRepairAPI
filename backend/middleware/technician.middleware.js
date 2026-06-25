const technicianOnly = (req, res, next) => {
  console.log("🔧 technicianOnly middleware called");
  
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

  console.log("✅ technicianOnly middleware complete, calling next()");
  next();
};

module.exports = { technicianOnly };