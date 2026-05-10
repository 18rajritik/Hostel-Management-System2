const dotenv = require("dotenv");
dotenv.config();

const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Deployment backend error: ${error.message}`
    });
  }
};
