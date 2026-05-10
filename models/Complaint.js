const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    category: {
      type: String,
      enum: ["maintenance", "electrical", "cleanliness", "other"],
      default: "other"
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
