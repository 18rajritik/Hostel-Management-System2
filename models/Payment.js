const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0
    },
    term: {
      type: String,
      required: [true, "Term is required"],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },
    paidDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending"
    },
    method: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Net Banking", "Pending"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
