const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    room_number: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true
    },
    block: {
      type: String,
      required: [true, "Block is required"],
      trim: true
    },
    floor: {
      type: Number,
      required: [true, "Floor is required"]
    },
    type: {
      type: String,
      enum: ["single", "double", "triple"],
      default: "single"
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1
    },
    occupied: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["available", "partial", "full", "maintenance"],
      default: "available"
    },
    amenities: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
