const Student = require("../models/Student");
const Fee = require("../models/Fee");
const Complaint = require("../models/Complaint");

const getStudentProfile = async (req, res, next) => {
  try {
    if (!req.user.student_id) {
      res.status(404);
      throw new Error("No student profile linked to this account.");
    }

    const student = await Student.findById(req.user.student_id).populate("room_id");
    if (!student) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    res.json({ success: true, data: student });
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

    const fees = await Fee.find({ student_id: req.user.student_id }).sort({ createdAt: -1 });
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

    const complaints = await Complaint.find({ student_id: req.user.student_id }).sort({ createdAt: -1 });
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
