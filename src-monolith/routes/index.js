// src/index.js
const express = require("express");
const router = express.Router();

const pasteRoutes = require("./pasteRoutes.js");
const analyticsRoutes = require("./analyticsRoutes.js");
const cleanupRoutes = require("./cleanupRoutes.js");

router.use("/", analyticsRoutes);
router.use("/", pasteRoutes);
router.use("/", cleanupRoutes);

module.exports = router;
