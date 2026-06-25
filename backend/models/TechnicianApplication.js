const mongoose = require('mongoose');

const technicianApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  experience: {
    type: String,
    default: ''
  },
  certifications: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    enum: ['available', 'part-time', 'full-time', 'on-call', 'not-available'],
    default: 'available'
  },
  about: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String
}, {
  timestamps: true
});

// ⚠️ NO PRE-SAVE HOOK - Password is hashed in the controller

const TechnicianApplication = mongoose.model('TechnicianApplication', technicianApplicationSchema);

module.exports = TechnicianApplication;