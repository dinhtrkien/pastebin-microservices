// src/interfaces/index.js
const express = require("express");
const router = express.Router();
const analyticsController = require("../domain/analytics/analyticsController");


// Landing page or create paste form
router.get("/analytic", analyticsController.getAnalytics);


module.exports = router;