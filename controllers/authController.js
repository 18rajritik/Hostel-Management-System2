const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  department: user.department,
  year: user.year,
  address: user.address,
  guardianName: user.guardianName,
  guardianPhone: user.guardianPhone
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, year } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error("Email is already registered.");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      department,
      year,
      role: "student"
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
};

module.exports = { register, login, me, sanitizeUser };
