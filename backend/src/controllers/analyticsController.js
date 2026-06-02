const analyticsService = require('../services/analyticsService');

function getAppBaseUrl(req) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return baseUrl.replace(/\/+$/, '');
}

async function getUrlAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    const analytics = await analyticsService.getUrlAnalytics(req.user._id, id, getAppBaseUrl(req));
    return res.json({ analytics });
  } catch (err) {
    return next(err);
  }
}

async function getUserAnalytics(req, res, next) {
  try {
    const analytics = await analyticsService.getUserAnalytics(req.user._id, getAppBaseUrl(req));
    return res.json({ analytics });
  } catch (err) {
    return next(err);
  }
}

async function getPublicUrlStats(req, res, next) {
  try {
    const { shortCode } = req.params;
    const analytics = await analyticsService.getPublicUrlStats(shortCode, getAppBaseUrl(req));
    return res.json({ analytics });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getUrlAnalytics, getUserAnalytics, getPublicUrlStats };
