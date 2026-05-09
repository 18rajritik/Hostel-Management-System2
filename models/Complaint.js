const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true
    },
    category: {
      type: String,
      enum: ["Maintenance", "Food", "Internet", "Roommate", "Security", "Other"],
      default: "Other"
    },
    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending"
    },
    adminNote: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
