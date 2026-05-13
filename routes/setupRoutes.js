const express = require("express");
const { bootstrapDemoData, createDefaultUnits } = require("../controllers/setupController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roles");

const router = express.Router();

router.post("/bootstrap-demo", bootstrapDemoData);
router.post("/create-default-units", protect, isAdmin, createDefaultUnits);

module.exports = router;
