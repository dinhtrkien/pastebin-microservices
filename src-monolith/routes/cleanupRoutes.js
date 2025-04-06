const express = require('express');
const router = express.Router();
const cleanupController = require('../domain/cleanup/cleanupController.js');

// Endpoint to manually trigger cleanup
router.get('/cleanup', cleanupController.runCleanup);

module.exports = router;