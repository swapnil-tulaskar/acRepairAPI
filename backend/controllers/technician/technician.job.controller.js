const Repair = require("../../models/Repair.js");

// ==================== GET MY ASSIGNED JOBS =================
const getMyAssignedJobs = async (req, res) => {
  try {
    const repairs = await Repair.find({ technicianId: req.user.id })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    const stats = {
      total: repairs.length,
      inProgress: repairs.filter(r => r.status === "in-progress").length,
      completed: repairs.filter(r => r.status === "completed").length,
      assigned: repairs.filter(r => r.status === "assigned").length
    };

    res.json({
      success: true,
      stats,
      count: repairs.length,
      data: repairs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== GET JOB DETAILS =================
const getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const repair = await Repair.findOne({
      _id: id,
      technicianId: req.user.id
    }).populate("userId", "name email phone");

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not assigned to you"
      });
    }

    res.json({ success: true, data: repair });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== UPDATE JOB STATUS =================
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["in-progress", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Technicians can only update status to: in-progress, completed"
      });
    }

    const repair = await Repair.findOne({
      _id: id,
      technicianId: req.user.id
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not assigned to you"
      });
    }

    if (repair.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Job is already completed"
      });
    }

    if (repair.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Job is cancelled. Cannot update status."
      });
    }

    repair.status = status;
    if (status === "completed") {
      repair.completedAt = new Date();
    }
    await repair.save();

    res.json({
      success: true,
      data: repair,
      message: `Job status updated to ${status}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== ADD WORK NOTES =================
const addWorkNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Notes are required"
      });
    }

    const repair = await Repair.findOne({
      _id: id,
      technicianId: req.user.id
    });

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not assigned to you"
      });
    }

    repair.notes = repair.notes || [];
    repair.notes.push({
      text: notes,
      addedBy: req.user.id,
      addedAt: new Date()
    });
    await repair.save();

    res.json({
      success: true,
      message: "Notes added successfully",
      data: repair
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  getMyAssignedJobs,
  getJobDetails,
  updateJobStatus,
  addWorkNotes
};