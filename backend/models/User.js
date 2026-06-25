const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name too short"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"]
    },
    role: {
      type: String,
      enum: ["user", "admin", "technician"],
      default: "user"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    specialization: {
      type: String,
      default: "General"
    },
    assignedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repair"
    }]
  },
  { timestamps: true }
);

//userSchema.index({ email: 1 }, { unique: true });
//userSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);