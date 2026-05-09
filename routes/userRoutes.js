const express = require("express");
const { body } = require("express-validator");
const { getStudents, updateProfile, deleteStudent } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, authorize("admin"), getStudents);
router.put(
  "/me",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim(),
    body("department").optional().trim(),
    body("year").optional().trim()
  ],
  validate,
  updateProfile
);
router.delete("/:id", protect, authorize("admin"), deleteStudent);

module.exports = router;
