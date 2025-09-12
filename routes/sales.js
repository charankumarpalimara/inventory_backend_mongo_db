const express = require('express');
const saleController = require('../controllers/saleController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(verifyToken);

router.get('/', saleController.getAllSales);
router.get('/analytics', saleController.getSalesAnalytics);
router.get('/:id', saleController.getSaleById);
router.post('/', saleController.createSale);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
