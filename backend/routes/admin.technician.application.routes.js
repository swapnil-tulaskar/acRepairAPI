const express = require('express');
const {
  getAllApplications,
  getApplication,
  approveApplication,
  rejectApplication
} = require('../controllers/admin/technicianApplication.controller.js');
const { protect } = require('../middleware/auth.middleware.js');
const { adminOnly } = require('../middleware/admin.middleware.js');

const router = express.Router();

// All routes are protected and admin only
router.use(protect, adminOnly);

// GET all technician applications
router.get('/', getAllApplications);

// GET single application
router.get('/:id', getApplication);

// PATCH approve application
router.patch('/:id/approve', approveApplication);

// PATCH reject application
router.patch('/:id/reject', rejectApplication);

module.exports = router;