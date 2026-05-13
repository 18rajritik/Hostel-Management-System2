const express = require("express");
const { body } = require("express-validator");
const { register, login, forgotPassword, me, adminProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("username").optional().trim().notEmpty().withMessage("Username cannot be empty"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
  ],
  validate,
  forgotPassword
);

router.get("/me", protect, me);
router.get("/admin-profile", protect, isAdmin, adminProfile);

module.exports = router;
