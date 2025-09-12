const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

// Jewelry validation rules
const validateJewelry = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('sku').trim().isLength({ min: 1 }).withMessage('SKU is required'),
  body('category').isIn(['rings', 'necklaces', 'earrings', 'bracelets', 'watches', 'other']).withMessage('Valid category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  validate
];

// Customer validation rules
const validateCustomer = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validate
];

// Sale validation rules
const validateSale = [
  body('jewelryId').isMongoId().withMessage('Valid jewelry ID is required'),
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  validate
];

module.exports = {
  validateUser,
  validateJewelry,
  validateCustomer,
  validateSale,
  validate
};
