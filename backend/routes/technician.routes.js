const express = require("express");
const { protect } = require("../middleware/auth.middleware.js");
const { technicianOnly } = require("../middleware/technician.middleware.js");
const {
  getMyAssignedJobs,
  getJobDetails,
  updateJobStatus,
  addWorkNotes
} = require("../controllers/technician/technician.job.controller.js");

const router = express.Router();

// All routes require authentication and approved technician status
router.use(protect);
router.use(technicianOnly);

router.get("/jobs", getMyAssignedJobs);
router.get("/jobs/:id", getJobDetails);
router.patch("/jobs/:id/status", updateJobStatus);
router.post("/jobs/:id/notes", addWorkNotes);

module.exports = router;