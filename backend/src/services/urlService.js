const QRCode = require('qrcode');
const Url = require('../models/Url');
const ApiError = require('../errors/ApiError');
const { generateUniqueShortCode } = require('../utils/codeGenerator');
const { isValidAlias, isValidUrl, normalizeUrl } = require('../utils/urlValidator');
const { parse } = require('csv-parse/sync');

function buildShortUrl(baseUrl, shortCode) {
  return `${baseUrl.replace(/\/+$|\s+/g, '')}/${shortCode}`;
}

async function generateQrCodeDataUrl(value) {
  return QRCode.toDataURL(value);
}

async function findExistingUrlForUser(userId, longUrl) {
  return Url.findOne({ user: userId, longUrl });
}

async function createShortUrl(userId, longUrl, customAlias, expiresAtRaw) {
  const normalizedUrl = normalizeUrl(longUrl);
  const alias = String(customAlias || '').trim() || null;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  if (!normalizedUrl) {
    throw new ApiError(400, 'The longUrl field is required.');
  }

  if (!isValidUrl(normalizedUrl)) {
    throw new ApiError(400, 'Please provide a valid URL using http:// or https://.');
  }

  if (alias && !isValidAlias(alias)) {
    throw new ApiError(
      400,
      'Custom alias must be 4-30 characters and may only contain letters, numbers, hyphens, and underscores.'
    );
  }

  if (expiresAtRaw) {
    if (Number.isNaN(expiresAt.getTime())) {
      throw new ApiError(400, 'Expiration date must be a valid date.');
    }
    if (expiresAt <= new Date()) {
      throw new ApiError(400, 'Expiration date must be in the future.');
    }
  }

  const existingUrl = await findExistingUrlForUser(userId, normalizedUrl);
  if (existingUrl) {
    if (alias && existingUrl.shortCode !== alias) {
      throw new ApiError(
        409,
        'A short URL already exists for this destination. Delete the existing one first to choose a new custom alias.'
      );
    }

    if (alias && existingUrl.shortCode === alias) {
      return existingUrl;
    }

    return existingUrl;
  }

  if (alias) {
    const aliasConflict = await findUrlByShortCode(alias);
    if (aliasConflict) {
      throw new ApiError(409, 'The custom alias is already in use. Please choose another one.');
    }
  }

  const shortCode = alias || (await generateUniqueShortCode((code) => Url.exists({ shortCode: code })));

  try {
    return await Url.create({
      longUrl: normalizedUrl,
      shortCode,
      user: userId,
      expiresAt: expiresAt || null
    });
  } catch (error) {
    const duplicateKey = error.code === 11000;
    if (duplicateKey) {
      if (error.message.includes('shortCode')) {
        return createShortUrl(userId, normalizedUrl, alias, expiresAtRaw);
      }
      if (error.message.includes('user') && error.message.includes('longUrl')) {
        const existing = await findExistingUrlForUser(userId, normalizedUrl);
        if (existing) {
          return existing;
        }
      }
    }
    throw new ApiError(500, 'Unable to create a unique shortened URL at this time.');
  }
}

function getUrlsForUser(userId) {
  return Url.find({ user: userId, active: true }).sort({ createdAt: -1 });
}

async function findUrlByShortCode(shortCode) {
  return Url.findOne({ shortCode });
}

async function resolveRedirectUrl(shortCode) {
  const url = await findUrlByShortCode(shortCode);
  if (!url || !url.active) {
    throw new ApiError(404, 'Link not found');
  }

  if (url.expiresAt && url.expiresAt <= new Date()) {
    throw new ApiError(410, 'This link has expired');
  }

  return url;
}

async function incrementClickCount(urlId) {
  return Url.findByIdAndUpdate(urlId, { $inc: { clicks: 1 } }, { new: true });
}

async function deleteUrlById(userId, urlId) {
  const url = await Url.findOne({ _id: urlId, user: userId, active: true });
  if (!url) {
    throw new ApiError(404, 'URL not found or access denied');
  }

  url.active = false;
  await url.save();
  return url;
}

function parseCsvRows(fileBuffer) {
  const text = fileBuffer.toString('utf-8');
  const rows = parse(text, {
    skip_empty_lines: true,
    trim: true
  });

  if (rows.length === 0) {
    throw new ApiError(400, 'CSV file is empty.');
  }

  const headers = rows[0].map((value) => String(value || '').trim().toLowerCase());
  const hasHeader = headers.some((value) => ['longurl', 'long_url', 'url'].includes(value));

  return rows.map((row, index) => {
    const rowNumber = index + 1;

    if (hasHeader && index === 0) {
      return null;
    }

    if (hasHeader) {
      const line = {};
      headers.forEach((columnName, columnIndex) => {
        const rawValue = String(row[columnIndex] || '').trim();
        if (['longurl', 'long_url', 'url'].includes(columnName)) {
          line.longUrl = rawValue;
        } else if (columnName === 'alias') {
          line.alias = rawValue;
        } else if (['expiresat', 'expires_at', 'expiration'].includes(columnName)) {
          line.expiresAt = rawValue;
        }
      });
      return { rowNumber, longUrl: line.longUrl || '', alias: line.alias || '', expiresAt: line.expiresAt || '' };
    }

    return {
      rowNumber,
      longUrl: String(row[0] || '').trim(),
      alias: String(row[1] || '').trim(),
      expiresAt: String(row[2] || '').trim()
    };
  }).filter(Boolean);
}

async function bulkCreateShortUrls(userId, fileBuffer, baseUrl) {
  const records = parseCsvRows(fileBuffer);
  const results = [];

  for (const record of records) {
    if (!record.longUrl) {
      results.push({ row: record.rowNumber, longUrl: record.longUrl, alias: record.alias || null, error: 'Missing longUrl value.' });
      continue;
    }

    try {
      const url = await createShortUrl(userId, record.longUrl, record.alias || undefined, record.expiresAt || undefined);
      const formatted = await formatUrlResponse(url, baseUrl);
      results.push({ row: record.rowNumber, url: formatted });
    } catch (err) {
      if (err instanceof ApiError) {
        results.push({ row: record.rowNumber, longUrl: record.longUrl, alias: record.alias || null, error: err.message });
        continue;
      }
      throw err;
    }
  }

  return results;
}

async function formatUrlResponse(url, baseUrl) {
  const shortUrl = buildShortUrl(baseUrl, url.shortCode);
  const qrCodeUrl = await generateQrCodeDataUrl(shortUrl);

  return {
    id: url._id.toString(),
    longUrl: url.longUrl,
    shortCode: url.shortCode,
    shortUrl,
    qrCodeUrl,
    clicks: url.clicks,
    expiresAt: url.expiresAt || null,
    createdAt: url.createdAt,
    updatedAt: url.updatedAt
  };
}

module.exports = {
  createShortUrl,
  getUrlsForUser,
  bulkCreateShortUrls,
  deleteUrlById,
  findUrlByShortCode,
  resolveRedirectUrl,
  incrementClickCount,
  formatUrlResponse
};
