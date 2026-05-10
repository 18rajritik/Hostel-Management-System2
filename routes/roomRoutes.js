const express = require("express");
const { body } = require("express-validator");
const {
  getRooms,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");
const { isWarden } = require("../middleware/roles");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, getRooms);
router.get("/available", protect, getAvailableRooms);
router.post(
  "/",
  protect,
  isWarden,
  [
    body("room_number").trim().notEmpty().withMessage("Room number is required"),
    body("block").trim().notEmpty().withMessage("Block is required"),
    body("floor").isNumeric().withMessage("Floor is required"),
    body("capacity").isNumeric().withMessage("Capacity is required")
  ],
  validate,
  createRoom
);
router.put("/:id", protect, isWarden, updateRoom);
router.delete("/:id", protect, isWarden, deleteRoom);

module.exports = router;
