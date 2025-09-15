const express = require('express');
const userController = require('../controllers/userController.js');
const { verifyToken, requireRole } = require('../middleware/auth.js');

const router = express.Router();

// Routes
router.get('/', verifyToken, requireRole(['admin', 'superadmin']), userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, requireRole(['admin', 'superadmin']), userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, requireRole(['admin', 'superadmin']), userController.deleteUser);
router.delete('/bulk', verifyToken, requireRole(['admin', 'superadmin']), userController.bulkDeleteUsers);
router.patch('/:id/toggle-status', verifyToken, requireRole(['admin', 'superadmin']), userController.toggleUserStatus);

module.exports = router;