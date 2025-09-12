const express = require('express');
const alertController = require('../controllers/alertController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(verifyToken);

router.get('/', alertController.getAllAlerts);
router.get('/low-stock', alertController.getLowStockAlerts);
router.get('/out-of-stock', alertController.getOutOfStockAlerts);

module.exports = router;
