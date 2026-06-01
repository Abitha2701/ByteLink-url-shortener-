const Url = require('../models/Url');
const ApiError = require('../errors/ApiError');
const { generateUniqueShortCode } = require('../utils/codeGenerator');
const { isValidUrl, normalizeUrl } = require('../utils/urlValidator');

async function findExistingUrlForUser(userId, longUrl) {
  return Url.findOne({ user: userId, longUrl });
}

async function createShortUrl(userId, longUrl) {
  const normalizedUrl = normalizeUrl(longUrl);

  if (!normalizedUrl) {
    throw new ApiError(400, 'The longUrl field is required.');
  }

  if (!isValidUrl(normalizedUrl)) {
    throw new ApiError(400, 'Please provide a valid URL using http:// or https://.');
  }

  const existingUrl = await findExistingUrlForUser(userId, normalizedUrl);
  if (existingUrl) {
    return existingUrl;
  }

  const shortCode = await generateUniqueShortCode((code) => Url.exists({ shortCode: code }));

  try {
    return await Url.create({
      longUrl: normalizedUrl,
      shortCode,
      user: userId
    });
  } catch (error) {
    const duplicateKey = error.code === 11000;
    if (duplicateKey) {
      if (error.message.includes('shortCode')) {
        return createShortUrl(userId, normalizedUrl);
      }
      if (error.message.includes('user') && error.message.includes('longUrl')) {
        const existing = await findExistingUrlForUser(userId, normalizedUrl);
        if (existing) {
          return existing;
        }
      }
    }
    throw new ApiError(500, 'Unable to create a unique shortened URL at this time.');
  }
}

function getUrlsForUser(userId) {
  return Url.find({ user: userId, active: true }).sort({ createdAt: -1 });
}

function formatUrlResponse(url, baseUrl) {
  return {
    id: url._id.toString(),
    longUrl: url.longUrl,
    shortCode: url.shortCode,
    shortUrl: `${baseUrl.replace(/\/+$/, '')}/${url.shortCode}`,
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
