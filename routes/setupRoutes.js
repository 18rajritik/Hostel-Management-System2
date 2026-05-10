const express = require("express");
const { bootstrapDemoData } = require("../controllers/setupController");

const router = express.Router();

router.post("/bootstrap-demo", bootstrapDemoData);

module.exports = router;
