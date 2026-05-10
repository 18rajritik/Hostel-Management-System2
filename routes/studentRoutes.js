const express = require("express");
const { body } = require("express-validator");
const {
  getStudents,
  createStudent,
  updateStudent,
  vacateStudent
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { isWarden } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, isWarden, getStudents);
router.post(
  "/",
  protect,
  isWarden,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required")
  ],
  validate,
  createStudent
);
router.put("/:id", protect, isWarden, updateStudent);
router.put("/:id/vacate", protect, isWarden, vacateStudent);

module.exports = router;
