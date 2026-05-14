const User = require("../models/User");
const Student = require("../models/Student");
const generateToken = require("../utils/generateToken");

const parseAllowList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const serializeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  isApproved: user.role === "student" ? Boolean(user.isApproved) : true,
  student_id: user.student_id || null
});

const register = async (req, res, next) => {
  try {
    const { username, name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      throw new Error("User already exists.");
    }

    let student = await Student.findOne({ email });
    if (!student) {
      student = await Student.create({
        name: name || username || email.split("@")[0],
        email,
        phone,
        status: "pending"
      });
    } else if (!student.phone && phone) {
      student.phone = phone;
      await student.save();
    }

    const user = new User({
      username: username || name,
      email,
      password,
      role: "student",
      isApproved: false,
      student_id: student._id
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful. Your account is pending admin approval.",
      token: generateToken(user._id, user.role),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, adminLoginKey } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(400);
      throw new Error("Invalid password");
    }

    if (user.role === "admin") {
      const requiredAdminKey = process.env.ADMIN_LOGIN_KEY;
      if (requiredAdminKey && adminLoginKey !== requiredAdminKey) {
        res.status(403);
        throw new Error("Admin security key is invalid.");
      }

      const allowedOrigins = parseAllowList(process.env.ADMIN_ALLOWED_ORIGINS);
      const requestOrigin = req.get("origin") || "";
      if (allowedOrigins.length > 0 && requestOrigin && !allowedOrigins.includes(requestOrigin)) {
        res.status(403);
        throw new Error("Admin login blocked from this origin.");
      }

    }

    if (user.role === "student" && !user.isApproved) {
      res.status(403);
      throw new Error("Admin has not approved your account yet.");
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id, user.role),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("No account found with this email.");
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. Please log in with your new password."
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ success: true, user: serializeUser(req.user) });
};

const adminProfile = async (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    }
  });
};

module.exports = { register, login, forgotPassword, me, adminProfile, serializeUser };
