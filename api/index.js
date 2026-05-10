const dotenv = require("dotenv");
dotenv.config();

const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  const requestPath = req.url || "/";
  const needsDatabase = requestPath.startsWith("/api") && requestPath !== "/api/health";

  try {
    if (needsDatabase) {
      await connectDB();
    }

    return app(req, res);
  } catch (error) {
    if (!requestPath.startsWith("/api")) {
      return app(req, res);
    }

    return res.status(500).json({
      success: false,
      message: `Deployment backend error: ${error.message}`
    });
  }
};
