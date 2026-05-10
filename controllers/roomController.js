const Room = require("../models/Room");

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ block: 1, floor: 1, room_number: 1 });
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

const getAvailableRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      status: { $ne: "maintenance" },
      $expr: { $lt: ["$occupied", "$capacity"] }
    }).sort({ block: 1, floor: 1, room_number: 1 });

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : String(req.body.amenities || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const room = await Room.create({
      room_number: req.body.room_number,
      floor: req.body.floor,
      block: req.body.block,
      capacity: req.body.capacity,
      type: req.body.type,
      amenities
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.amenities !== undefined && !Array.isArray(payload.amenities)) {
      payload.amenities = String(payload.amenities)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const room = await Room.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!room) {
      res.status(404);
      throw new Error("Room not found.");
    }

    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      throw new Error("Room not found.");
    }

    if (room.occupied > 0) {
      res.status(400);
      throw new Error("Cannot delete a room that still has occupants.");
    }

    await room.deleteOne();
    res.json({ success: true, message: "Room deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRooms, getAvailableRooms, createRoom, updateRoom, deleteRoom };
