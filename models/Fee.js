const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      trim: true
    },
    payment_mode: {
      type: String,
      enum: ["cash", "upi", "card", "bank-transfer"],
      default: "cash"
    },
    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending"
    },
    paid_date: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
