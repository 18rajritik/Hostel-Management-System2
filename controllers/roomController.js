const Room = require("../models/Room");
const { getPagination, sendPaginated } = require("../utils/queryHelpers");

const listRooms = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search || "";
    const status = req.query.status;
    const filter = {
      $or: [
        { roomNumber: { $regex: search, $options: "i" } },
        { block: { $regex: search, $options: "i" } }
      ]
    };
    if (status) filter.status = status;

    await sendPaginated(
      res,
      Room.find(filter).populate("occupants", "name email").sort({ block: 1, floor: 1, roomNumber: 1 }).skip(skip).limit(limit),
      Room.countDocuments(filter),
      page,
      limit
    );
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
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
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      res.status(404);
      throw new Error("Room not found.");
    }
    res.json({ success: true, message: "Room deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { listRooms, createRoom, updateRoom, deleteRoom };
