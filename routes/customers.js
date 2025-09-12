const express = require('express');
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(verifyToken);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
