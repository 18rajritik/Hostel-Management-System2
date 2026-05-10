const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Student = require("../models/Student");
const Room = require("../models/Room");
const Complaint = require("../models/Complaint");
const Fee = require("../models/Fee");
const Notice = require("../models/Notice");

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Student.deleteMany(), Room.deleteMany(), Complaint.deleteMany(), Fee.deleteMany(), Notice.deleteMany()]);

  const admin = await User.create({
    username: "Admin Officer",
    email: "admin@hostel.com",
    password: "admin123",
    role: "admin"
  });

  const students = await Student.create([
    {
      name: "Aarav Sharma",
      email: "aarav@student.com",
      phone: "9876500011",
      course: "Computer Science",
      year: "3rd Year",
      address: "Jaipur, Rajasthan"
    },
    {
      name: "Meera Nair",
      email: "meera@student.com",
      phone: "9876500021",
      course: "Electronics",
      year: "2nd Year",
      address: "Kochi, Kerala"
    }
  ]);

  await User.create([
    {
      username: "Aarav Sharma",
      email: "aarav@student.com",
      password: "student123",
      role: "student",
      student_id: students[0]._id
    },
    {
      username: "Meera Nair",
      email: "meera@student.com",
      password: "student123",
      role: "student",
      student_id: students[1]._id
    }
  ]);

  const rooms = await Room.insertMany([
    { room_number: "A-101", block: "A", floor: 1, type: "double", capacity: 2, occupied: 1, status: "partial", amenities: ["WiFi", "Study Table"] },
    { room_number: "A-102", block: "A", floor: 1, type: "double", capacity: 2, occupied: 0, status: "available", amenities: ["WiFi"] },
    { room_number: "B-201", block: "B", floor: 2, type: "triple", capacity: 3, occupied: 1, status: "partial", amenities: ["WiFi", "Balcony"] },
    { room_number: "C-301", block: "C", floor: 3, type: "single", capacity: 1, occupied: 0, status: "maintenance", amenities: ["Quiet Wing"] }
  ]);

  students[0].room_id = rooms[0]._id;
  students[1].room_id = rooms[2]._id;
  await Promise.all(students.map((student) => student.save()));

  await Complaint.insertMany([
    {
      student_id: students[0]._id,
      title: "Wi-Fi is unstable",
      category: "other",
      description: "The connection drops during evening study hours.",
      status: "in-progress"
    },
    {
      student_id: students[1]._id,
      title: "Tube light not working",
      category: "maintenance",
      description: "Room corridor light is flickering.",
      status: "open"
    }
  ]);

  await Fee.insertMany([
    {
      student_id: students[0]._id,
      amount: 45000,
      month: "May 2026",
      paid_date: new Date("2026-05-01"),
      status: "paid",
      payment_mode: "upi"
    },
    {
      student_id: students[1]._id,
      amount: 45000,
      month: "June 2026",
      status: "pending",
      payment_mode: "bank-transfer"
    }
  ]);

  await Notice.insertMany([
    {
      title: "Welcome to the new session",
      content: "Please complete your hostel verification at the office desk this week.",
      category: "general",
      posted_by: admin._id,
      is_active: true
    },
    {
      title: "Lights out reminder",
      content: "Please maintain quiet hours from 10 PM onward.",
      category: "rules",
      posted_by: admin._id,
      is_active: true
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
