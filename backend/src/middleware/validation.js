const { body, param, query, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
}

const validateRegister = [
  body('email').isEmail().normalizeEmail().trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().trim(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateCreateUrl = [
  body('longUrl')
    .isURL({ require_protocol: true })
    .withMessage('Must be a valid URL with http:// or https://')
    .trim(),
  body('alias')
    .optional({ checkFalsy: true })
    .matches(/^[A-Za-z0-9_-]{4,30}$/)
    .withMessage('Alias must be 4-30 characters with only letters, numbers, hyphens, and underscores')
    .trim(),
  body('expiresAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  handleValidationErrors
];

const validateUrlId = [
  param('id').isMongoId().withMessage('Invalid URL ID format'),
  handleValidationErrors
];

const validateShortCode = [
  param('shortCode')
    .matches(/^[A-Za-z0-9_-]{4,30}$/)
    .withMessage('Invalid short code format'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateCreateUrl,
  validateUrlId,
  validateShortCode,
  validatePasswordChange
};
