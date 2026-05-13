const express = require("express");
const { body } = require("express-validator");
const {
  getComplaints,
  getOpenComplaints,
  resolveComplaint,
  updateComplaintStatus
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");
const { isWarden } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, isWarden, getComplaints);
router.get("/open", protect, isWarden, getOpenComplaints);
router.put("/:id/resolve", protect, isWarden, resolveComplaint);
router.put(
  "/:id/status",
  protect,
  isWarden,
  [body("status").isIn(["open", "in-progress", "resolved"]).withMessage("Invalid complaint status")],
  validate,
  updateComplaintStatus
);

module.exports = router;
