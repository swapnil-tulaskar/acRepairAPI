const Repair = require("../../models/Repair.js");
const User = require("../../models/User.js");
const TechnicianApplication = require("../../models/TechnicianApplication.js");

// ==================== ADMIN: VIEW ALL USERS =================
const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const keyword = req.query.search
      ? { email: { $regex: req.query.search, $options: "i" } }
      : {};

    const users = await User.find(keyword)
      .select("name email role phone isActive")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalUsers = await User.countDocuments(keyword);

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      count: formattedUsers.length,
      data: formattedUsers
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: VIEW ALL REPAIRS =================
const getAllRepairs = async (req, res) => {
  try {
    const { status, technicianId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (technicianId) filter.technicianId = technicianId;

    const repairs = await Repair.find(filter)
      .populate("userId", "name email phone")
      .populate("technicianId", "name email specialization")
      .sort({ createdAt: -1 });

    const stats = {
      total: repairs.length,
      pending: repairs.filter(r => r.status === "pending").length,
      assigned: repairs.filter(r => r.status === "assigned").length,
      inProgress: repairs.filter(r => r.status === "in-progress").length,
      completed: repairs.filter(r => r.status === "completed").length,
      cancelled: repairs.filter(r => r.status === "cancelled").length
    };

    res.json({
      success: true,
      stats,
      count: repairs.length,
      data: repairs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: UPDATE USER ROLE =================
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "userId and role are required"
      });
    }

    const allowedRoles = ["user", "admin", "technician"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: DELETE USER =================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==================== ADMIN: MANUALLY ASSIGN TECHNICIAN =================
const assignTechnician = async (req, res) => {
  try {
    const { repairId, technicianId } = req.body;

    if (!repairId || !technicianId) {
      return res.status(400).json({
        success: false,
        message: "repairId and technicianId are required"
      });
    }

    const technician = await User.findOne({ _id: technicianId, role: "technician" });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found"
      });
    }

    const repair = await Repair.findById(repairId);
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found"
      });
    }

    // Remove from previous technician
    if (repair.technicianId) {
      await User.findByIdAndUpdate(repair.technicianId, {
        $pull: { assignedJobs: repairId }
      });
    }

    // Assign new technician
    repair.technicianId = technicianId;
    repair.status = "assigned";
    repair.assignedAt = new Date();
    await repair.save();

    await User.findByIdAndUpdate(technicianId, {
      $push: { assignedJobs: repairId }
    });

    await repair.populate("technicianId", "name email specialization");

    res.json({
      success: true,
      message: "Technician assigned successfully",
      data: repair
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== ADMIN: DELETE ALL REPAIRS =================
const deleteAllRepairs = async (req, res) => {
  try {
    const result = await Repair.deleteMany({});

    // Clear assigned jobs from all technicians
    await User.updateMany(
      { role: "technician" },
      { $set: { assignedJobs: [] } }
    );

    return res.json({
      success: true,
      message: "All repairs deleted",
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ==================== ADMIN: DASHBOARD STATS =================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalTechnicians = await User.countDocuments({ role: "technician", isActive: true });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalRepairs = await Repair.countDocuments();
    const completedRepairs = await Repair.countDocuments({ status: "completed" });
    const pendingRepairs = await Repair.countDocuments({ status: "pending" });
    const inProgressRepairs = await Repair.countDocuments({ status: "in-progress" });
    const assignedRepairs = await Repair.countDocuments({ status: "assigned" });

    // Pending applications
    const pendingApplications = await TechnicianApplication.countDocuments({ status: "pending" });

    res.json({
      success: true,
      data: {
        users: { 
          total: totalUsers 
        },
        technicians: { 
          total: totalTechnicians,
          active: totalTechnicians
        },
        admins: { total: totalAdmins },
        repairs: {
          total: totalRepairs,
          completed: completedRepairs,
          pending: pendingRepairs,
          inProgress: inProgressRepairs,
          assigned: assignedRepairs,
          completionRate: totalRepairs ? ((completedRepairs / totalRepairs) * 100).toFixed(2) : 0
        },
        applications: {
          pending: pendingApplications
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== ADMIN: MAKE USER ADMIN =================
const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User promoted to admin",
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  getAllUsers,
  getAllRepairs,
  updateUserRole,
  deleteUser,
  assignTechnician,
  deleteAllRepairs,
  getDashboardStats,
  makeAdmin
};