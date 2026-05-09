const express = require("express");
const { body } = require("express-validator");
const {
  createApplication,
  listApplications,
  updateApplication
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, listApplications);
router.post(
  "/",
  protect,
  authorize("student"),
  [
    body("preferredBlock").optional().trim(),
    body("preferredFloor").optional().isInt({ min: 0 }).withMessage("Floor must be a positive number")
  ],
  validate,
  createApplication
);
router.put("/:id", protect, authorize("admin"), updateApplication);

module.exports = router;
