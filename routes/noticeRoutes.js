const express = require("express");
const { body } = require("express-validator");
const {
  getAllNotices,
  getActiveNotices,
  createNotice,
  updateNotice,
  deleteNotice
} = require("../controllers/noticeController");
const { protect } = require("../middleware/authMiddleware");
const { isWarden } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, isWarden, getAllNotices);
router.get("/active", protect, getActiveNotices);
router.post(
  "/",
  protect,
  isWarden,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required")
  ],
  validate,
  createNotice
);
router.put("/:id", protect, isWarden, updateNotice);
router.delete("/:id", protect, isWarden, deleteNotice);

module.exports = router;
