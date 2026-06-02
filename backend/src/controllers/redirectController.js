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
      if (err.statusCode === 410) {
        return res.status(410).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Link expired</title>
  <style>
    body { background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: Inter, system-ui, sans-serif; }
    .card { max-width: 520px; width: 100%; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); }
    h1 { margin: 0 0 16px; font-size: 2rem; }
    p { margin: 0 0 24px; line-height: 1.7; color: #475569; }
    a { display: inline-block; padding: 12px 20px; background: #0f172a; color: white; border-radius: 9999px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link expired</h1>
    <p>This shortened link has expired and is no longer available. If you own this link, create a new one with a fresh expiration date.</p>
    <a href="/">Go back to Bytelink</a>
  </div>
</body>
</html>`);
      }
      return res.status(err.statusCode).send(err.message);
    }
    console.error('Redirect error:', err);
    return res.status(500).send('Unable to redirect at this time');
  }
}

module.exports = { redirectToLongUrl };
