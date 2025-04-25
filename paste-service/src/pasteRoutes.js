const express = require("express");
const router = express.Router();
const pasteController = require("./pasteController");

// Create a new paste
router.post("/api/pastes", pasteController.createPaste);

// Get a paste by slug
router.get("/api/pastes/:slug", pasteController.getPaste);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;