const express = require('express');
const jewelryController = require('../controllers/jewelryController.js');
const { verifyToken } = require('../middleware/auth.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

// Routes
router.get('/', verifyToken, jewelryController.getAllJewelry);
router.get('/categories', verifyToken, jewelryController.getCategories);
router.get('/:id', verifyToken, jewelryController.getJewelryById);
router.post('/', verifyToken, upload.array('images', 10), jewelryController.createJewelry);
router.post('/bulk', verifyToken, jewelryController.bulkJewelryOperation);
router.put('/:id', verifyToken, upload.array('images', 10), jewelryController.updateJewelry);
router.delete('/:id', verifyToken, jewelryController.deleteJewelry);

module.exports = router  