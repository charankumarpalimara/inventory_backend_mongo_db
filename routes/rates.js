const express = require('express');
const rateController = require('../controllers/rateController.js');
const { verifyToken, requireRole } = require('../middleware/auth.js');

const router = express.Router();

// Routes
router.get('/', verifyToken, rateController.getRates);
router.put('/', verifyToken, requireRole(['admin', 'superadmin']), rateController.updateRates);
router.get('/history', verifyToken, rateController.getRateHistory);

module.exports = router;
