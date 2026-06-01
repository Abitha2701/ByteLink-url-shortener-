function isValidUrl(value) {
  try {
    const parsed = new URL(String(value).trim());
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normalizeUrl(value) {
  return String(value || '').trim();
}

module.exports = { isValidUrl, normalizeUrl };
