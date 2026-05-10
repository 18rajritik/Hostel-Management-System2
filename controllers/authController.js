const User = require("../models/User");
const Student = require("../models/Student");
const generateToken = require("../utils/generateToken");

const serializeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  student_id: user.student_id || null
});

const register = async (req, res, next) => {
  try {
    const { username, name, email, password, role = "student" } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      throw new Error("User already exists.");
    }

    const user = new User({
      username: username || name,
      email,
      password,
      role
    });

    if (role === "student") {
      const student = await Student.findOne({ email });
      if (student) user.student_id = student._id;
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id, user.role),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
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

const me = async (req, res) => {
  res.json({ success: true, user: serializeUser(req.user) });
};

module.exports = { register, login, me, serializeUser };
