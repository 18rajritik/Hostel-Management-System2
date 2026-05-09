const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
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
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available"
    }
  },
  { timestamps: true }
);

roomSchema.virtual("availableBeds").get(function availableBeds() {
  return Math.max(this.capacity - this.occupants.length, 0);
});

roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Room", roomSchema);
