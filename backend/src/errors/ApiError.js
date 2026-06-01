class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message || 'An error occurred');
    this.statusCode = statusCode || 500;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
