const express = require("express");
const { getComplaints, getOpenComplaints, resolveComplaint } = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");
const { isWarden } = require("../middleware/roles");

const router = express.Router();

router.get("/", protect, isWarden, getComplaints);
router.get("/open", protect, isWarden, getOpenComplaints);
router.put("/:id/resolve", protect, isWarden, resolveComplaint);

module.exports = router;
