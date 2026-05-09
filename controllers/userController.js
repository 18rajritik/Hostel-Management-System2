const User = require("../models/User");
const { getPagination, sendPaginated } = require("../utils/queryHelpers");
const { sanitizeUser } = require("./authController");

const getStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search || "";
    const filter = {
      role: "student",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } }
      ]
    };

    await sendPaginated(
      res,
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
      page,
      limit
    );
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "department",
      "year",
      "address",
      "guardianName",
      "guardianPhone"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });

    const updated = await req.user.save();
    res.json({ success: true, user: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: "student" });
    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }
    res.json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudents, updateProfile, deleteStudent };
