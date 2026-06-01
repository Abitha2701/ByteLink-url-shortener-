const analyticsService = require('../services/analyticsService');

async function getUrlAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    const analytics = await analyticsService.getUrlAnalytics(req.user._id, id);
    return res.json({ analytics });
  } catch (err) {
    return next(err);
  }
}

async function getUserAnalytics(req, res, next) {
  try {
    const analytics = await analyticsService.getUserAnalytics(req.user._id);
    return res.json({ analytics });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getUrlAnalytics, getUserAnalytics };
