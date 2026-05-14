const Student = require("../models/Student");
const Fee = require("../models/Fee");
const Complaint = require("../models/Complaint");

const getStudentProfile = async (req, res, next) => {
  try {
    if (!req.user.student_id) {
      res.status(404);
      throw new Error("No student profile linked to this account.");
    }

    const student = await Student.findById(req.user.student_id).populate("room_id").lean();
    if (!student) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    let roommates = [];
    if (student.room_id?._id) {
      roommates = await Student.find({
        room_id: student.room_id._id,
        _id: { $ne: student._id }
      })
        .select("name email phone age course year")
        .sort({ name: 1 })
        .lean();
    }

    res.json({
      success: true,
      data: {
        ...student,
        roommates
      }
    });
  } catch (error) {
    next(error);
  }
};

const getStudentFees = async (req, res, next) => {
  try {
    if (!req.user.student_id) {
      res.status(404);
      throw new Error("No student profile linked to this account.");
    }

    const fees = await Fee.find({ student_id: req.user.student_id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

const getStudentComplaints = async (req, res, next) => {
  try {
    if (!req.user.student_id) {
      res.status(404);
      throw new Error("No student profile linked to this account.");
    }

    const complaints = await Complaint.find({ student_id: req.user.student_id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

const createStudentComplaint = async (req, res, next) => {
  try {
    if (!req.user.student_id) {
      res.status(404);
      throw new Error("No student profile linked to this account.");
    }

    const complaint = await Complaint.create({
      student_id: req.user.student_id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentProfile,
  getStudentFees,
  getStudentComplaints,
  createStudentComplaint
};
