const Repair = require("../models/Repair.js");
const User = require("../models/User.js");

const autoAssignTechnician = async (repairId) => {
  try {
    console.log("Auto-assigning technician for repair:", repairId);
    
    const technicians = await User.find({ 
      role: "technician", 
      isActive: true 
    }).select("_id assignedJobs");

    console.log("Available technicians:", technicians.length);

    if (technicians.length === 0) {
      console.log("No technicians available");
      return await Repair.findById(repairId);
    }

    // Sort by number of assigned jobs (least busy first)
    technicians.sort((a, b) => a.assignedJobs.length - b.assignedJobs.length);
    const selectedTechnician = technicians[0];
    console.log("Selected technician:", selectedTechnician._id);

    const repair = await Repair.findByIdAndUpdate(
      repairId,
      {
        technicianId: selectedTechnician._id,
        status: "assigned",
        assignedAt: new Date()
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      selectedTechnician._id,
      { $push: { assignedJobs: repairId } }
    );

    return repair;
  } catch (err) {
    console.error("Error in autoAssignTechnician:", err);
    throw err;
  }
};

module.exports = { autoAssignTechnician };