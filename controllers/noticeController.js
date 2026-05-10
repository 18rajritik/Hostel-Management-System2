const Notice = require("../models/Notice");

const getAllNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate("posted_by", "username email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

const getActiveNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find({ is_active: true })
      .populate("posted_by", "username")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

const createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      is_active: req.body.is_active,
      posted_by: req.user._id
    });

    const populated = await Notice.findById(notice._id).populate("posted_by", "username email role");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("posted_by", "username email role");

    if (!notice) {
      res.status(404);
      throw new Error("Notice not found.");
    }

    res.json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      res.status(404);
      throw new Error("Notice not found.");
    }

    res.json({ success: true, message: "Notice deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotices,
  getActiveNotices,
  createNotice,
  updateNotice,
  deleteNotice
};
