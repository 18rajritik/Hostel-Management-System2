const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    course: {
      type: String,
      trim: true,
      default: ""
    },
    year: {
      type: String,
      trim: true,
      default: ""
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null
    },
    status: {
      type: String,
      enum: ["active", "vacated", "pending"],
      default: "active"
    },
    join_date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
