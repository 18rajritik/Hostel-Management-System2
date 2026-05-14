const express = require("express");
const { body } = require("express-validator");
const {
  getStudents,
  createStudent,
  updateStudent,
  vacateStudent,
  deleteStudent,
  updateStudentAccess
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
    body("email").isEmail().withMessage("Valid email is required"),
    body("age").optional({ values: "falsy" }).isInt({ min: 1, max: 120 }).withMessage("Age must be between 1 and 120")
  ],
  validate,
  createStudent
);
router.put("/:id", protect, isWarden, updateStudent);
router.put("/:id/vacate", protect, isWarden, vacateStudent);
router.delete("/:id", protect, isWarden, deleteStudent);
router.put(
  "/:id/access",
  protect,
  isWarden,
  [
    body("approved").isBoolean().withMessage("approved must be true or false"),
    body("unit").optional().isIn(["Unit-1", "Unit-2", "unit-1", "unit-2"]).withMessage("unit must be Unit-1 or Unit-2"),
    body("meal_type").optional().isIn(["veg", "non-veg"]).withMessage("meal_type must be veg or non-veg"),
    body("payment_mode").optional().isIn(["cash", "upi"]).withMessage("payment_mode must be cash or upi")
  ],
  validate,
  updateStudentAccess
);

module.exports = router;
