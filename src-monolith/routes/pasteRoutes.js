// src/interfaces/index.js
const express = require("express");
const router = express.Router();

const pasteController = require("../domain/paste/pasteController");


// Handle create paste (form POST)
router.post("/paste", pasteController.createPaste);

// Paste detail page
router.get("/paste/:slug", pasteController.showDetailPage);

// Landing page or create paste form
router.get("/", pasteController.showCreatePastePage);


module.exports = router;