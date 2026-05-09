const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Room = require("../models/Room");
const Application = require("../models/Application");
const Complaint = require("../models/Complaint");
const Payment = require("../models/Payment");

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Room.deleteMany(),
    Application.deleteMany(),
    Complaint.deleteMany(),
    Payment.deleteMany()
  ]);

  const admin = await User.create({
    name: "Admin Officer",
    email: "admin@hostel.com",
    password: "admin123",
    role: "admin",
    phone: "9000000001"
  });

  const students = await User.create([
    {
      name: "Aarav Sharma",
      email: "aarav@student.com",
      password: "student123",
      role: "student",
      phone: "9876500011",
      department: "Computer Science",
      year: "3rd Year",
      address: "Jaipur, Rajasthan",
      guardianName: "Rakesh Sharma",
      guardianPhone: "9876500012"
    },
    {
      name: "Meera Nair",
      email: "meera@student.com",
      password: "student123",
      role: "student",
      phone: "9876500021",
      department: "Electronics",
      year: "2nd Year",
      address: "Kochi, Kerala",
      guardianName: "Anita Nair",
      guardianPhone: "9876500022"
    }
  ]);

  const rooms = await Room.insertMany([
    { roomNumber: "A-101", block: "A", floor: 1, capacity: 2, occupants: [students[0]._id], status: "available" },
    { roomNumber: "A-102", block: "A", floor: 1, capacity: 2, occupants: [], status: "available" },
    { roomNumber: "B-201", block: "B", floor: 2, capacity: 3, occupants: [students[1]._id], status: "available" },
    { roomNumber: "C-301", block: "C", floor: 3, capacity: 1, occupants: [], status: "maintenance" }
  ]);

  await Application.insertMany([
    {
      student: students[0]._id,
      preferredBlock: "A",
      preferredFloor: 1,
      notes: "Prefer quiet room for exam preparation.",
      status: "Approved",
      allottedRoom: rooms[0]._id
    },
    {
      student: students[1]._id,
      preferredBlock: "B",
      preferredFloor: 2,
      notes: "Need room near electronics lab side.",
      status: "Pending"
    }
  ]);

  await Complaint.insertMany([
    {
      student: students[0]._id,
      title: "Wi-Fi is unstable",
      category: "Internet",
      description: "The connection drops during evening study hours.",
      status: "In Progress",
      adminNote: "Network vendor has been notified."
    },
    {
      student: students[1]._id,
      title: "Tube light not working",
      category: "Maintenance",
      description: "Room corridor light is flickering.",
      status: "Pending"
    }
  ]);

  await Payment.insertMany([
    {
      student: students[0]._id,
      amount: 45000,
      term: "Semester 5",
      dueDate: new Date("2026-07-10"),
      paidDate: new Date("2026-05-01"),
      status: "Paid",
      method: "UPI"
    },
    {
      student: students[1]._id,
      amount: 45000,
      term: "Semester 3",
      dueDate: new Date("2026-07-10"),
      status: "Pending",
      method: "Pending"
    }
  ]);

  console.log("Seed data inserted successfully.");
  console.log("Admin login: admin@hostel.com / admin123");
  console.log("Student login: aarav@student.com / student123");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
