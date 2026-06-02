const ApiError = require('../errors/ApiError');
const urlService = require('../services/urlService');

function getAppBaseUrl(req) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return baseUrl.replace(/\/+$/, '');
}

async function createUrl(req, res, next) {
  const { longUrl, alias, expiresAt } = req.body;

  try {
    const url = await urlService.createShortUrl(req.user._id, longUrl, alias, expiresAt);
    const response = await urlService.formatUrlResponse(url, getAppBaseUrl(req));
    return res.status(201).json({ url: response });
  } catch (err) {
    return next(err);
  }
}

async function getMyUrls(req, res, next) {
  try {
    const urls = await urlService.getUrlsForUser(req.user._id);
    const baseUrl = getAppBaseUrl(req);
    const formatted = await Promise.all(urls.map((url) => urlService.formatUrlResponse(url, baseUrl)));
    return res.json({ urls: formatted });
  } catch (err) {
    return next(err);
  }
}

async function bulkCreateUrls(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      throw new ApiError(400, 'CSV file is required.');
    }

    const baseUrl = getAppBaseUrl(req);
    const results = await urlService.bulkCreateShortUrls(req.user._id, req.file.buffer, baseUrl);
    return res.status(200).json({ results });
  } catch (err) {
    return next(err);
  }
}

async function deleteUrl(req, res, next) {
  try {
    const { id } = req.params;
    await urlService.deleteUrlById(req.user._id, id);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}

module.exports = { createUrl, getMyUrls, bulkCreateUrls, deleteUrl };
