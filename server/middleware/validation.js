const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('masterPassword')
    .isLength({ min: 8 })
    .withMessage('Master password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Password entry validation
const validatePassword = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  body('website')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (urlPattern.test(value)) return true;
      throw new Error('Website must be a valid URL');
    }),
  body('email')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      const emailPattern = /^\S+@\S+\.\S+$/;
      if (emailPattern.test(value)) return true;
      throw new Error('Email must be valid');
    }),
  body('category')
    .optional()
    .isIn(['social', 'work', 'finance', 'entertainment', 'shopping', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePassword,
  handleValidationErrors
};