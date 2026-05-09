const User = require("../models/User");
const Room = require("../models/Room");
const Complaint = require("../models/Complaint");
const Payment = require("../models/Payment");

const getAnalytics = async (req, res, next) => {
  try {
    const [students, rooms, occupiedRooms, complaints, pendingPayments] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Room.countDocuments(),
      Room.countDocuments({ status: "occupied" }),
      Complaint.countDocuments({ status: { $ne: "Resolved" } }),
      Payment.countDocuments({ status: { $in: ["Pending", "Overdue"] } })
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: students,
        totalRooms: rooms,
        roomsOccupied: occupiedRooms,
        availableRooms: Math.max(rooms - occupiedRooms, 0),
        activeComplaints: complaints,
        pendingPayments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
