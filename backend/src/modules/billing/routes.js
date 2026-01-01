const express = require('express');
const router = express.Router();
const usageController = require('./controllers/usageController');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/usage', protect, usageController.getStats);

module.exports = router;