const User = require("../models/User");
const Student = require("../models/Student");
const Room = require("../models/Room");
const Fee = require("../models/Fee");
const Complaint = require("../models/Complaint");
const Notice = require("../models/Notice");
const { syncRoomOccupancy } = require("./studentController");

const DEMO_ACCOUNTS = {
  admin: {
    username: "Admin Officer",
    email: "admin@hostel.com",
    password: "admin123",
    role: "admin"
  },
  student: {
    username: "Aarav Sharma",
    email: "aarav@student.com",
    password: "student123",
    role: "student"
  }
};

const ensureUser = async ({ username, email, password, role, student_id = null }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ username, email, password, role, student_id });
  } else if (student_id && !user.student_id) {
    user.student_id = student_id;
    await user.save();
  }
  return user;
};

const bootstrapDemoData = async (req, res, next) => {
  try {
    let room = await Room.findOne({ room_number: "A-101" });
    if (!room) {
      room = await Room.create({
        room_number: "A-101",
        block: "A",
        floor: 1,
        type: "double",
        capacity: 2,
        occupied: 0,
        status: "available",
        amenities: ["WiFi", "Study Table", "Wardrobe"]
      });
    }

    let student = await Student.findOne({ email: DEMO_ACCOUNTS.student.email });
    if (!student) {
      student = await Student.create({
        name: "Aarav Sharma",
        email: DEMO_ACCOUNTS.student.email,
        phone: "9876500011",
        course: "B.Tech Computer Science",
        year: "3rd Year",
        address: "Jaipur, Rajasthan",
        room_id: room._id,
        status: "active"
      });
    } else if (!student.room_id) {
      student.room_id = room._id;
      student.status = "active";
      await student.save();
    }

    const admin = await ensureUser(DEMO_ACCOUNTS.admin);
    const studentUser = await ensureUser({ ...DEMO_ACCOUNTS.student, student_id: student._id });

    await syncRoomOccupancy(room._id);

    const feeCount = await Fee.countDocuments({ student_id: student._id });
    if (feeCount === 0) {
      await Fee.insertMany([
        {
          student_id: student._id,
          amount: 45000,
          month: "May 2026",
          payment_mode: "upi",
          status: "paid",
          paid_date: new Date("2026-05-01")
        },
        {
          student_id: student._id,
          amount: 45000,
          month: "June 2026",
          payment_mode: "bank-transfer",
          status: "pending"
        }
      ]);
    }

    const complaintCount = await Complaint.countDocuments({ student_id: student._id });
    if (complaintCount === 0) {
      await Complaint.create({
        student_id: student._id,
        title: "Reading light flickering",
        description: "The light near the study desk switches off randomly.",
        category: "electrical",
        status: "open"
      });
    }

    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.insertMany([
        {
          title: "Semester Fee Reminder",
          content: "Please clear pending hostel fees before the 10th of each month.",
          category: "fees",
          posted_by: admin._id,
          is_active: true
        },
        {
          title: "Quiet Hours",
          content: "Study quiet hours are in effect from 10 PM to 6 AM every day.",
          category: "rules",
          posted_by: admin._id,
          is_active: true
        }
      ]);
    }

    res.json({
      success: true,
      message: "Demo data is ready.",
      credentials: {
        admin: {
          email: DEMO_ACCOUNTS.admin.email,
          password: DEMO_ACCOUNTS.admin.password
        },
        student: {
          email: DEMO_ACCOUNTS.student.email,
          password: DEMO_ACCOUNTS.student.password
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const buildRoomCodes = () => {
  const ranges = [
    [1, 7],
    [101, 120],
    [201, 220],
    [301, 320]
  ];

  const roomCodes = [];
  ranges.forEach(([start, end]) => {
    for (let value = start; value <= end; value += 1) {
      roomCodes.push(String(value).padStart(3, "0"));
    }
  });

  return roomCodes;
};

const getFloorFromCode = (code) => {
  if (code.startsWith("3")) return 3;
  if (code.startsWith("2")) return 2;
  if (code.startsWith("1")) return 1;
  return 0;
};

const createDefaultUnits = async (req, res, next) => {
  try {
    const units = [
      { prefix: "U1", block: "Unit-1" },
      { prefix: "U2", block: "Unit-2" }
    ];
    const roomCodes = buildRoomCodes();
    const amenities = ["WiFi", "Study Table"];

    const operations = [];
    units.forEach((unit) => {
      roomCodes.forEach((code) => {
        operations.push({
          updateOne: {
            filter: { room_number: `${unit.prefix}-${code}` },
            update: {
              $setOnInsert: {
                room_number: `${unit.prefix}-${code}`,
                block: unit.block,
                floor: getFloorFromCode(code),
                type: "double",
                capacity: 2,
                occupied: 0,
                status: "available",
                amenities
              }
            },
            upsert: true
          }
        });
      });
    });

    const result = await Room.bulkWrite(operations, { ordered: false });
    const perUnitRooms = roomCodes.length;

    res.json({
      success: true,
      message: "Default units created/verified successfully.",
      data: {
        unitCount: units.length,
        roomsPerUnit: perUnitRooms,
        totalPlannedRooms: units.length * perUnitRooms,
        createdRooms: result.upsertedCount || 0,
        existingRooms: units.length * perUnitRooms - (result.upsertedCount || 0),
        capacityPerRoom: 2
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { bootstrapDemoData, createDefaultUnits };
