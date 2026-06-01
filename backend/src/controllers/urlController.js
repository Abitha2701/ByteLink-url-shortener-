const ApiError = require('../errors/ApiError');
const urlService = require('../services/urlService');

function getAppBaseUrl(req) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return baseUrl.replace(/\/+$/, '');
}

async function createUrl(req, res, next) {
  const { longUrl } = req.body;

  try {
    const url = await urlService.createShortUrl(req.user._id, longUrl);
    const response = urlService.formatUrlResponse(url, getAppBaseUrl(req));
    return res.status(201).json({ url: response });
  } catch (err) {
    return next(err);
  }
}

async function getMyUrls(req, res, next) {
  try {
    const urls = await urlService.getUrlsForUser(req.user._id);
    const baseUrl = getAppBaseUrl(req);
    const formatted = urls.map((url) => urlService.formatUrlResponse(url, baseUrl));
    return res.json({ urls: formatted });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createUrl, getMyUrls };
