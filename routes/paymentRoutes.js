const express = require("express");
const { body } = require("express-validator");
const {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, listPayments);
router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("student").isMongoId().withMessage("Valid student id is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
    body("term").trim().notEmpty().withMessage("Term is required"),
    body("dueDate").isISO8601().withMessage("Due date is required")
  ],
  validate,
  createPayment
);
router.put("/:id", protect, authorize("admin"), updatePayment);
router.delete("/:id", protect, authorize("admin"), deletePayment);

module.exports = router;
