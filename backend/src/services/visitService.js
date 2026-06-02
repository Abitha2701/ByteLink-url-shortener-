const Visit = require('../models/Visit');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

function normalizeDeviceType(type) {
  if (!type) {
    return 'desktop';
  }
  if (type === 'smartphone' || type === 'mobile') {
    return 'mobile';
  }
  return type;
}

async function recordVisit(urlId, metadata = {}) {
  const ipAddress = metadata.ipAddress || null;
  const parsed = new UAParser(metadata.userAgent || '');
  const geo = ipAddress ? geoip.lookup(ipAddress) : null;

  const visit = {
    url: urlId,
    visitedAt: new Date(),
    ipAddress,
    userAgent: metadata.userAgent || null,
    referrer: metadata.referrer || null,
    browser: parsed.browser.name || null,
    os: parsed.os.name || null,
    device: normalizeDeviceType(parsed.device.type),
    country: geo?.country || null,
    city: geo?.city || null
  };

  return Visit.create(visit);
}

module.exports = { recordVisit };
