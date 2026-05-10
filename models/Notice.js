const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true
    },
    category: {
      type: String,
      enum: ["general", "fees", "maintenance", "rules"],
      default: "general"
    },
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
