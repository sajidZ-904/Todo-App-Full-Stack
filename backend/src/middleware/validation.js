const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

const validateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  
  body('categoryId')
    .optional()
    .isString()
    .withMessage('Category ID must be a string'),
  
  handleValidationErrors
];

const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color (e.g., #FF5733)'),
  
  handleValidationErrors
];

const validateTaskQuery = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category filter must be a string'),
  
  query('status')
    .optional()
    .isIn(['all', 'completed', 'pending'])
    .withMessage('Status must be all, completed, or pending'),
  
  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  
  query('search')
    .optional()
    .isString()
    .withMessage('Search term must be a string'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'dueDate', 'title', 'priority'])
    .withMessage('Sort by must be createdAt, dueDate, title, or priority'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  handleValidationErrors
];

const validateId = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID must be a valid string'),
  
  handleValidationErrors
];

module.exports = {
  validateTask,
  validateCategory,
  validateTaskQuery,
  validateId
};