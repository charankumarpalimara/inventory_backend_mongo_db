const express = require('express');
const jewelryController = require('../controllers/jewelryController.js');
const { verifyToken } = require('../middleware/auth.js');

const router = express.Router();

// Routes
router.get('/', verifyToken, jewelryController.getAllJewelry);
router.get('/categories', verifyToken, jewelryController.getCategories);
router.get('/:id', verifyToken, jewelryController.getJewelryById);
router.post('/', verifyToken, jewelryController.createJewelry);
router.put('/:id', verifyToken, jewelryController.updateJewelry);
router.delete('/:id', verifyToken, jewelryController.deleteJewelry);

module.exports = router  