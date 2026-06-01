const authService = require('../services/authService');
const ApiError = require('../errors/ApiError');

function parseBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1].trim();
}

async function getUserFromToken(token) {
  if (!token) {
    throw new ApiError(401, 'Missing authentication token');
  }

  try {
    const payload = authService.verifyToken(token);
    const user = await authService.findById(payload.sub);

    if (!user) {
      throw new ApiError(401, 'Invalid token or user not found');
    }

    return { user, payload };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }

    if (err.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }

    throw err;
  }
}

module.exports = { parseBearerToken, getUserFromToken };
