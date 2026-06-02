const ApiError = require('../errors/ApiError');
const logger = require('../utils/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Centralized error handler middleware
 * Catches all errors thrown in route handlers and middleware
 */
function errorHandler(err, req, res, next) {
  // Extract error information
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;
  const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Response object
  const response = {
    error: {
      id: errorId,
      message,
      ...(process.env.NODE_ENV === 'development' && { code: err.code }),
    },
  };

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    response.error.message = 'Validation failed';
    response.error.details = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    response.error.message = 'Invalid ID format';
    response.error.details = {
      field: err.path,
      value: err.value,
    };
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyPattern)[0];
    response.error.message = `${field} already exists`;
    response.error.details = { field };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    response.error.message = 'Invalid or expired token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    response.error.message = 'Token has expired';
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    if (err.originalError) {
      response.error.originalError = err.originalError.message;
    }
  }

  // Log error
  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    // Log server errors
    logger.error(`[${errorId}] ${message}`, {
      statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?._id,
      error: err.message,
      stack: err.stack,
    });
  } else if (statusCode >= HTTP_STATUS.BAD_REQUEST) {
    // Log client errors (4xx)
    logger.warn(`[${errorId}] ${message}`, {
      statusCode,
      path: req.path,
      method: req.method,
      error: err.message,
    });
  }

  // Send response
  res.status(statusCode).json(response);
}

module.exports = errorHandler;
