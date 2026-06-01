const ApiError = require('../errors/ApiError');
const authService = require('../services/authService');

async function signup(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(400, 'Name, email and password are required'));
  }

  try {
    const user = await authService.createUser({ name, email, password });
    const token = authService.generateToken(user);

    return res.status(201).json({ user: authService.getPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, 'Email and password are required'));
  }

  try {
    const user = await authService.findByEmail(email);
    const valid = user && (await authService.validatePassword(password, user.passwordHash));

    if (!user || !valid) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const token = authService.generateToken(user);
    return res.json({ user: authService.getPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
}

async function getProfile(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  return res.json({ user: authService.getPublicUser(req.user) });
}

module.exports = { signup, login, getProfile };
