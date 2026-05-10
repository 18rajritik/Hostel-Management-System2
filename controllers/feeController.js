const Fee = require("../models/Fee");

const getFees = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== "all") filter.status = req.query.status;

    const fees = await Fee.find(filter)
      .populate("student_id")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

const getPendingFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ status: { $in: ["pending", "overdue"] } })
      .populate("student_id")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

const createFee = async (req, res, next) => {
  try {
    const payload = {
      student_id: req.body.student_id,
      amount: req.body.amount,
      month: req.body.month,
      payment_mode: req.body.payment_mode,
      status: req.body.status
    };

    if (payload.status === "paid") payload.paid_date = req.body.paid_date || new Date();

    const fee = await Fee.create(payload);
    const populated = await Fee.findById(fee._id).populate("student_id").lean();
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateFee = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.status === "paid" && !payload.paid_date) payload.paid_date = new Date();

    const fee = await Fee.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    }).populate("student_id");

    if (!fee) {
      res.status(404);
      throw new Error("Fee record not found.");
    }

    res.json({ success: true, data: fee });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFees, getPendingFees, createFee, updateFee };
