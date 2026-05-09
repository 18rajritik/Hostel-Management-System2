const Complaint = require("../models/Complaint");
const { getPagination, sendPaginated } = require("../utils/queryHelpers");

const createComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.create({
      student: req.user._id,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description
    });
    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

const listComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search || "";
    const filter = req.user.role === "admin" ? {} : { student: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    await sendPaginated(
      res,
      Complaint.find(filter)
        .populate("student", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
      page,
      limit
    );
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, adminNote: req.body.adminNote },
      { new: true, runValidators: true }
    ).populate("student", "name email");

    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found.");
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComplaint, listComplaints, updateComplaint };
