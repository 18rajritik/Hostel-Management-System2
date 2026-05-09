const Payment = require("../models/Payment");
const { getPagination, sendPaginated } = require("../utils/queryHelpers");

const listPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = req.user.role === "admin" ? {} : { student: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.student) filter.student = req.query.student;

    await sendPaginated(
      res,
      Payment.find(filter).populate("student", "name email").sort({ dueDate: 1 }).skip(skip).limit(limit),
      Payment.countDocuments(filter),
      page,
      limit
    );
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    await payment.populate("student", "name email");
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("student", "name email");

    if (!payment) {
      res.status(404);
      throw new Error("Payment not found.");
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      res.status(404);
      throw new Error("Payment not found.");
    }
    res.json({ success: true, message: "Payment deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { listPayments, createPayment, updatePayment, deletePayment };
