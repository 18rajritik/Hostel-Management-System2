const express = require("express");
const { body } = require("express-validator");
const {
  createComplaint,
  listComplaints,
  updateComplaint
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, listComplaints);
router.post(
  "/",
  protect,
  authorize("student"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required")
  ],
  validate,
  createComplaint
);
router.put("/:id", protect, authorize("admin"), updateComplaint);

module.exports = router;
