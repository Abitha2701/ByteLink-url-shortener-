const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');

const SALT_ROUNDS = 10;

async function createUser({ name, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    throw new ApiError(400, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
  return user;
}

function findByEmail(email) {
  return User.findOne({ email: String(email || '').trim().toLowerCase() });
}

function findById(id) {
  return User.findById(id).select('-passwordHash');
}

function validatePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function getTokenPayload(user) {
  return { sub: user._id.toString(), email: user.email };
}

function getPublicUser(user) {
  if (!user) return null;
  const { _id, name, email, createdAt, updatedAt } = user;
  return { id: _id.toString(), name, email, createdAt, updatedAt };
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, 'JWT_SECRET is not defined');
  }

  return jwt.sign(getTokenPayload(user), secret, {
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, 'JWT_SECRET is not defined');
  }

  return jwt.verify(token, secret, { algorithms: ['HS256'] });
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  validatePassword,
  generateToken,
  verifyToken,
  getPublicUser
};
