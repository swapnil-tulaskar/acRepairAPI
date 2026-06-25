const User = require("../../models/User.js");
const Repair = require("../../models/Repair.js");
const bcrypt = require("bcryptjs");

// ==================== ADMIN: CREATE TECHNICIAN DIRECTLY =================
const createTechnician = async (req, res) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const technician = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "technician",
      specialization: specialization || "General",
      isActive: true
    });

    const technicianResponse = technician.toObject();
    delete technicianResponse.password;

    res.status(201).json({
      success: true,
      message: "Technician created successfully",
      data: technicianResponse
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: VIEW ALL TECHNICIANS =================
const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technician" })
      .select("name email phone specialization isActive assignedJobs createdAt")
      .sort({ createdAt: -1 });

    // Get counts of assigned jobs
    const techniciansWithCounts = await Promise.all(technicians.map(async (tech) => {
      const techObj = tech.toObject();
      techObj.assignedJobsCount = techObj.assignedJobs ? techObj.assignedJobs.length : 0;
      return techObj;
    }));

    res.json({
      success: true,
      count: techniciansWithCounts.length,
      data: techniciansWithCounts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: UPDATE TECHNICIAN STATUS =================
const updateTechnicianStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean"
      });
    }

    const technician = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found"
      });
    }

    res.json({
      success: true,
      message: `Technician ${isActive ? "activated" : "deactivated"}`,
      data: technician
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: DELETE TECHNICIAN =================
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await User.findOneAndDelete({ _id: id, role: "technician" });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found"
      });
    }

    // Unassign all jobs from this technician
    await Repair.updateMany(
      { technicianId: id },
      { technicianId: null, status: "pending" }
    );

    res.json({
      success: true,
      message: "Technician deleted successfully",
      data: {
        id: technician._id,
        name: technician.name,
        email: technician.email
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
  createTechnician,
  getAllTechnicians,
  updateTechnicianStatus,
  deleteTechnician
};