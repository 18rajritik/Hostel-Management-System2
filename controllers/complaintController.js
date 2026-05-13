const Complaint = require("../models/Complaint");

const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate("student_id")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

const getOpenComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: "resolved" } })
      .populate("student_id")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

const resolveComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true, runValidators: true }
    ).populate("student_id");

    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found.");
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("student_id");

    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found.");
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComplaints, getOpenComplaints, resolveComplaint, updateComplaintStatus };
