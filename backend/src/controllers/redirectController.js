const ApiError = require('../errors/ApiError');
const urlService = require('../services/urlService');
const visitService = require('../services/visitService');

async function redirectToLongUrl(req, res) {
  const { shortCode } = req.params;

  try {
    const url = await urlService.resolveRedirectUrl(shortCode);
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      referrer: req.get('referrer') || req.get('referer') || null
    };

    await visitService.recordVisit(url._id, metadata);
    await urlService.incrementClickCount(url._id);

    return res.redirect(url.longUrl);
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).send(err.message);
    }
    console.error('Redirect error:', err);
    return res.status(500).send('Unable to redirect at this time');
  }
}

module.exports = { redirectToLongUrl };
