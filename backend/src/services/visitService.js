const Visit = require('../models/Visit');

async function recordVisit(urlId, metadata = {}) {
  const visit = {
    url: urlId,
    visitedAt: new Date(),
    ipAddress: metadata.ipAddress || null,
    userAgent: metadata.userAgent || null,
    referrer: metadata.referrer || null
  };

  return Visit.create(visit);
}

module.exports = { recordVisit };
