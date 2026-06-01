const ApiError = require('../errors/ApiError');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  const response = {
    message: err.message || 'Internal server error'
  };

  if (err.name === 'ValidationError') {
    statusCode = 400;
    response.message = 'Validation failed';
    response.errors = Object.values(err.errors).map((error) => error.message);
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  if (!(err instanceof ApiError) && statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
