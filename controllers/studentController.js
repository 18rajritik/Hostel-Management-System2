const Student = require("../models/Student");
const Room = require("../models/Room");

const syncRoomOccupancy = async (roomId) => {
  if (!roomId) return null;

  const occupied = await Student.countDocuments({ room_id: roomId });
  const room = await Room.findById(roomId);
  if (!room) return null;

  room.occupied = occupied;
  if (room.status !== "maintenance") {
    if (occupied <= 0) room.status = "available";
    else if (occupied >= room.capacity) room.status = "full";
    else room.status = "partial";
  }

  await room.save();
  return room;
};

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate("room_id")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      course: req.body.course,
      year: req.body.year,
      address: req.body.address,
      room_id: req.body.room_id || null
    });

    if (student.room_id) await syncRoomOccupancy(student.room_id);

    const populated = await Student.findById(student._id).populate("room_id");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    const previousRoomId = student.room_id ? String(student.room_id) : null;
    const nextRoomId = req.body.room_id === undefined ? previousRoomId : req.body.room_id;

    if (nextRoomId) {
      const room = await Room.findById(nextRoomId);
      if (!room) {
        res.status(404);
        throw new Error("Room not found.");
      }

      const occupants = await Student.countDocuments({
        room_id: nextRoomId,
        _id: { $ne: student._id }
      });

      if (occupants >= room.capacity) {
        res.status(400);
        throw new Error("Selected room is already full.");
      }
    }

    const allowedFields = ["name", "email", "phone", "course", "year", "address", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    if (req.body.room_id !== undefined) {
      student.room_id = req.body.room_id || null;
    }

    await student.save();

    if (previousRoomId && previousRoomId !== nextRoomId) await syncRoomOccupancy(previousRoomId);
    if (nextRoomId) await syncRoomOccupancy(nextRoomId);

    const updated = await Student.findById(student._id).populate("room_id");
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const vacateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    const previousRoomId = student.room_id ? String(student.room_id) : null;
    student.room_id = null;
    student.status = "vacated";
    await student.save();

    if (previousRoomId) await syncRoomOccupancy(previousRoomId);

    res.json({ success: true, message: "Student vacated successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  vacateStudent,
  syncRoomOccupancy
};
