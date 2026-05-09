const express = require("express");
const { body } = require("express-validator");
const { listRooms, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

const roomValidation = [
  body("roomNumber").trim().notEmpty().withMessage("Room number is required"),
  body("block").trim().notEmpty().withMessage("Block is required"),
  body("floor").isInt({ min: 0 }).withMessage("Floor must be a positive number"),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1")
];

router.get("/", protect, listRooms);
router.post("/", protect, authorize("admin"), roomValidation, validate, createRoom);
router.put("/:id", protect, authorize("admin"), updateRoom);
router.delete("/:id", protect, authorize("admin"), deleteRoom);

module.exports = router;
