const { parseBearerToken, getUserFromToken } = require('../helpers/authHelpers');
const ApiError = require('../errors/ApiError');

async function requireAuth(req, res, next) {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) {
    return next(new ApiError(401, 'Missing or invalid Authorization header'));
  }

  try {
    const { user } = await getUserFromToken(token);
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth };
