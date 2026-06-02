function isValidUrl(value) {
  try {
    const parsed = new URL(String(value).trim());
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isValidAlias(value) {
  return /^[A-Za-z0-9_-]{4,30}$/.test(String(value || '').trim());
}

function normalizeUrl(value) {
  return String(value || '').trim();
}

module.exports = { isValidUrl, isValidAlias, normalizeUrl };
