const express = require('express');
const analyticsController = require('../controllers/analyticsController.js');
const { verifyToken } = require('../middleware/auth.js');

const router = express.Router();

// Routes
router.get('/', verifyToken, analyticsController.getAnalytics);

module.exports = router;
