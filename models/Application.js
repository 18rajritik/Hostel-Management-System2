const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    preferredBlock: {
      type: String,
      trim: true,
      default: ""
    },
    preferredFloor: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    allottedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
