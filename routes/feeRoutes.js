const express = require("express");
const { body } = require("express-validator");
const { getFees, getPendingFees, createFee, updateFee } = require("../controllers/feeController");
const { protect } = require("../middleware/authMiddleware");
const { isWarden } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, getFees);
router.get("/pending", protect, getPendingFees);
router.post(
  "/",
  protect,
  isWarden,
  [
    body("student_id").isMongoId().withMessage("Valid student is required"),
    body("amount").isNumeric().withMessage("Amount is required"),
    body("month").trim().notEmpty().withMessage("Month is required")
  ],
  validate,
  createFee
);
router.put("/:id", protect, isWarden, updateFee);

module.exports = router;
