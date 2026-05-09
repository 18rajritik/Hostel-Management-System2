const express = require("express");
const { getAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAnalytics);

module.exports = router;
