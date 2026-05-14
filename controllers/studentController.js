const Student = require("../models/Student");
const Room = require("../models/Room");
const User = require("../models/User");
const Fee = require("../models/Fee");
const Complaint = require("../models/Complaint");

const FEE_BY_MEAL_TYPE = {
  veg: 79000,
  "non-veg": 89000
};

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
      .sort({ createdAt: -1 })
      .lean();
    const studentIds = students.map((student) => student._id);
    const users = await User.find({ role: "student", student_id: { $in: studentIds } })
      .select("student_id isApproved")
      .lean();
    const accessByStudentId = new Map(users.map((user) => [String(user.student_id), Boolean(user.isApproved)]));
    const enriched = students.map((student) => ({
      ...student,
      accessApproved: accessByStudentId.get(String(student._id)) || false
    }));

    res.json({ success: true, data: enriched });
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
      age: req.body.age ?? null,
      course: req.body.course,
      year: req.body.year,
      address: req.body.address,
      room_id: req.body.room_id || null
    });

    if (student.room_id) await syncRoomOccupancy(student.room_id);

    const populated = await Student.findById(student._id).populate("room_id").lean();
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

    const allowedFields = ["name", "email", "phone", "age", "course", "year", "address", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    if (req.body.room_id !== undefined) {
      student.room_id = req.body.room_id || null;
    }

    await student.save();

    if (previousRoomId && previousRoomId !== nextRoomId) await syncRoomOccupancy(previousRoomId);
    if (nextRoomId) await syncRoomOccupancy(nextRoomId);

    const updated = await Student.findById(student._id).populate("room_id").lean();
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

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    const user = await User.findOne({ role: "student", student_id: student._id });
    const accessApproved = user ? Boolean(user.isApproved) : false;

    if (student.status !== "vacated" && accessApproved) {
      res.status(400);
      throw new Error("Only vacated or not-approved students can be deleted.");
    }

    const previousRoomId = student.room_id ? String(student.room_id) : null;

    await Promise.all([
      Student.deleteOne({ _id: student._id }),
      User.deleteMany({ role: "student", student_id: student._id }),
      Fee.deleteMany({ student_id: student._id }),
      Complaint.deleteMany({ student_id: student._id })
    ]);

    if (previousRoomId) await syncRoomOccupancy(previousRoomId);

    res.json({ success: true, message: "Student and related records deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const updateStudentAccess = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    const user = await User.findOne({ role: "student", student_id: student._id });
    if (!user) {
      res.status(404);
      throw new Error("Student login account not found for this profile.");
    }

    const approved = Boolean(req.body.approved);
    user.isApproved = approved;
    student.status = approved ? "active" : "pending";

    let feeRecord = null;
    if (approved) {
      const unit = String(req.body.unit || "").trim();
      const mealType = String(req.body.meal_type || "").trim().toLowerCase();
      const paymentMode = String(req.body.payment_mode || "").trim().toLowerCase();

      if (!["unit-1", "unit-2"].includes(unit.toLowerCase())) {
        res.status(400);
        throw new Error("Unit is required (Unit-1 or Unit-2) while approving student access.");
      }

      if (!Object.keys(FEE_BY_MEAL_TYPE).includes(mealType)) {
        res.status(400);
        throw new Error("Meal type is required (veg or non-veg) while approving student access.");
      }

      if (!["cash", "upi"].includes(paymentMode)) {
        res.status(400);
        throw new Error("Payment mode must be cash or upi while approving student access.");
      }

      const amount = FEE_BY_MEAL_TYPE[mealType];
      const now = new Date();
      const monthLabel = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

      feeRecord = await Fee.findOneAndUpdate(
        { student_id: student._id, month: monthLabel },
        {
          student_id: student._id,
          amount,
          month: monthLabel,
          payment_mode: paymentMode,
          status: "paid",
          paid_date: now
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    await Promise.all([user.save(), student.save()]);

    res.json({
      success: true,
      message: approved ? "Student access approved." : "Student access revoked.",
      data: {
        student_id: student._id,
        accessApproved: user.isApproved,
        status: student.status,
        fee: feeRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  vacateStudent,
  deleteStudent,
  updateStudentAccess,
  syncRoomOccupancy
};
