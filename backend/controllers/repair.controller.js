const Repair = require("../models/Repair.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const { autoAssignTechnician } = require("../services/assignment.service.js");

// CREATE REPAIR (User)
const createRepair = async (req, res) => {
  try {
    console.log("📝 createRepair called");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const repair = await Repair.create({
      ...req.body,
      userId: req.user.id,
      status: "pending"
    });

    // Try to auto-assign technician
    try {
      const assignedRepair = await autoAssignTechnician(repair._id);
      await assignedRepair.populate("technicianId", "name email specialization");
      
      res.status(201).json({ 
        success: true, 
        data: assignedRepair,
        message: "Repair created and technician assigned automatically"
      });
    } catch (assignError) {
      res.status(201).json({ 
        success: true, 
        data: repair,
        message: "Repair created successfully. Technician will be assigned later."
      });
    }

  } catch (err) {
    console.error("Error in createRepair:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET MY REPAIRS (User)
const getRepairs = async (req, res) => {
  try {
    console.log("📋 getRepairs called for user:", req.user.id);
    
    const repairs = await Repair.find({ userId: req.user.id })
      .populate("technicianId", "name email phone specialization")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: repairs.length,
      data: repairs 
    });

  } catch (err) {
    console.error("Error in getRepairs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE REPAIR (User)
const deleteRepair = async (req, res) => {
  try {
    console.log("🗑️ deleteRepair called for id:", req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const repair = await Repair.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!repair) {
      return res.status(404).json({ success: false, message: "Repair not found or unauthorized" });
    }

    // Remove from technician's assigned jobs if assigned
    if (repair.technicianId) {
      await User.findByIdAndUpdate(
        repair.technicianId,
        { $pull: { assignedJobs: repair._id } }
      );
    }

    res.json({ 
      success: true, 
      message: "Repair deleted successfully" 
    });

  } catch (err) {
    console.error("Error in deleteRepair:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE REPAIR STATUS (Admin Only)
const updateRepairStatus = async (req, res) => {
  try {
    console.log("🔄 updateRepairStatus called for id:", req.params.id);
    console.log("Status:", req.body.status);
    
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "assigned", "in-progress", "completed", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const repair = await Repair.findById(id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair not found"
      });
    }

    repair.status = status;
    if (status === "completed") {
      repair.completedAt = new Date();
    }
    await repair.save();

    res.json({
      success: true,
      message: `Repair status updated to ${status}`,
      data: repair
    });

  } catch (err) {
    console.error("Error in updateRepairStatus:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ✅ MAKE SURE ALL FUNCTIONS ARE EXPORTED
module.exports = {
  createRepair,
  getRepairs,
  deleteRepair,
  updateRepairStatus
};