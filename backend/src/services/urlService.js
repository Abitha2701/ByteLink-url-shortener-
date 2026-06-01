const Url = require('../models/Url');
const ApiError = require('../errors/ApiError');

const CODE_LENGTH = 7;
const CODE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function generateShortCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARACTERS.charAt(Math.floor(Math.random() * CODE_CHARACTERS.length));
  }
  return code;
}

async function generateUniqueShortCode() {
  let shortCode;
  let exists = true;

  while (exists) {
    shortCode = generateShortCode();
    exists = await Url.exists({ shortCode });
  }

  return shortCode;
}

async function createShortUrl(userId, longUrl) {
  const normalizedUrl = String(longUrl || '').trim();

  if (!normalizedUrl) {
    throw new ApiError(400, 'The longUrl field is required.');
  }

  if (!isValidUrl(normalizedUrl)) {
    throw new ApiError(400, 'Please provide a valid URL using http:// or https://.');
  }

  const shortCode = await generateUniqueShortCode();
  const url = await Url.create({
    longUrl: normalizedUrl,
    shortCode,
    user: userId
  });

  return url;
}

function getUrlsForUser(userId) {
  return Url.find({ user: userId, active: true }).sort({ createdAt: -1 });
}

function formatUrlResponse(url, baseUrl) {
  return {
    id: url._id.toString(),
    longUrl: url.longUrl,
    shortCode: url.shortCode,
    shortUrl: `${baseUrl}/${url.shortCode}`,
    clicks: url.clicks,
    createdAt: url.createdAt,
    updatedAt: url.updatedAt
  };
}

module.exports = {
  createShortUrl,
  getUrlsForUser,
  formatUrlResponse
};
