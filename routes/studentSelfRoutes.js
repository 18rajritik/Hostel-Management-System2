const express = require("express");
const { body } = require("express-validator");
const {
  getStudentProfile,
  getStudentFees,
  getStudentComplaints,
  createStudentComplaint
} = require("../controllers/studentSelfController");
const { protect } = require("../middleware/authMiddleware");
const { isStudent } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect, isStudent);
router.get("/me", getStudentProfile);
router.get("/me/fees", getStudentFees);
router.get("/me/complaints", getStudentComplaints);
router.post(
  "/me/complaints",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("category")
      .isIn(["maintenance", "electrical", "cleanliness", "other"])
      .withMessage("Valid category is required")
  ],
  validate,
  createStudentComplaint
);

module.exports = router;
