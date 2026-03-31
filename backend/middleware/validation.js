import { body, param, validationResult } from 'express-validator'

// Custom validator to check for potential XSS/injection patterns
const noSuspiciousChars = (value) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(value)) {
      throw new Error('Invalid characters detected')
    }
  }
  return true
}

// Validation middleware for register endpoint
export const validateRegister = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email too long')
    .custom(noSuspiciousChars),
  
  body('username')
    .trim()
    .matches(/^[a-zA-Z0-9_-]{3,}$/)
    .withMessage('Username must be 3+ characters, alphanumeric only')
    .custom(noSuspiciousChars),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, numbers, and special characters (@$!%*?&)')
    .custom(noSuspiciousChars),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
]

// Validation middleware for login endpoint
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required')
    .isLength({ max: 255 })
    .custom(noSuspiciousChars),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
]

// Validation for survey creation
export const validateCreateSurvey = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters')
    .custom(noSuspiciousChars),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be under 1000 characters')
    .custom(noSuspiciousChars),
  
  body('questions')
    .isArray()
    .withMessage('Questions must be an array')
    .custom((value) => value.length > 0)
    .withMessage('At least one question is required')
]

// Validation for survey update
export const validateUpdateSurvey = [
  param('id')
    .isMongoId()
    .withMessage('Invalid survey ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters')
    .custom(noSuspiciousChars),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be under 1000 characters')
    .custom(noSuspiciousChars)
]

// Validation for survey response
export const validateSurveyResponse = [
  param('id')
    .isMongoId()
    .withMessage('Invalid survey ID'),
  
  body('responses')
    .isArray()
    .withMessage('Responses must be an array')
]

// Validation for MongoDB ID
export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
]

// Utility to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    })
  }
  next()
}
