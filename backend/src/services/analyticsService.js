const mongoose = require('mongoose');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const ApiError = require('../errors/ApiError');

function buildDateBuckets(days) {
  const buckets = [];
  const now = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    const key = day.toISOString().slice(0, 10);
    buckets.push({ date: key, count: 0 });
  }
  return buckets;
}

function normalizeDailyCounts(rawCounts, days) {
  const buckets = buildDateBuckets(days);
  const countsByDate = rawCounts.reduce((map, item) => {
    map[item._id] = item.count;
    return map;
  }, {});

  return buckets.map((bucket) => ({
    date: bucket.date,
    count: countsByDate[bucket.date] || 0
  }));
}

async function getUrlAnalytics(userId, urlId, days = 14) {
  if (!mongoose.Types.ObjectId.isValid(urlId)) {
    throw new ApiError(400, 'Invalid URL identifier');
  }

  const url = await Url.findOne({ _id: urlId, user: userId, active: true });
  if (!url) {
    throw new ApiError(404, 'URL not found');
  }

  const matchStage = { url: url._id };

  const summaryPromise = Visit.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: 1 },
        lastVisitedAt: { $max: '$visitedAt' }
      }
    }
  ]);

  const dailyPromise = Visit.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$visitedAt', timezone: 'UTC' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const recentVisitsPromise = Visit.find(matchStage)
    .sort({ visitedAt: -1 })
    .limit(10)
    .select('visitedAt referrer ipAddress userAgent')
    .lean();

  const [summaryResults, dailyResults, recentVisits] = await Promise.all([
    summaryPromise,
    dailyPromise,
    recentVisitsPromise
  ]);

  const totalClicks = summaryResults[0]?.totalClicks || 0;
  const lastVisitedAt = summaryResults[0]?.lastVisitedAt || null;
  const daysActive = Math.max(1, Math.ceil((new Date() - url.createdAt) / (1000 * 60 * 60 * 24)));
  const averageClicksPerDay = totalClicks / daysActive;
  const peakDayClicks = dailyResults.reduce((max, item) => Math.max(max, item.count), 0);

  return {
    url: {
      id: url._id.toString(),
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      expiresAt: url.expiresAt || null,
      createdAt: url.createdAt,
      clicks: url.clicks
    },
    metrics: {
      totalClicks,
      lastVisitedAt,
      daysActive,
      averageClicksPerDay: Number(averageClicksPerDay.toFixed(2)),
      peakDayClicks
    },
    dailyClickCounts: normalizeDailyCounts(dailyResults, days),
    recentVisits: recentVisits.map((visit) => ({
      visitedAt: visit.visitedAt,
      referrer: visit.referrer || null,
      ipAddress: visit.ipAddress || null,
      userAgent: visit.userAgent || null
    }))
  };
}

async function getUserAnalytics(userId, days = 14) {
  const urls = await Url.find({ user: userId, active: true }).select('_id shortCode longUrl clicks createdAt').lean();

  if (urls.length === 0) {
    return {
      totalUrls: 0,
      totalClicks: 0,
      lastVisitedAt: null,
      activeUrls: 0,
      dailyClickCounts: normalizeDailyCounts([], days),
      topUrls: [],
      recentVisits: []
    };
  }

  const urlIds = urls.map((url) => url._id);

  const summaryPromise = Visit.aggregate([
    { $match: { url: { $in: urlIds } } },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: 1 },
        lastVisitedAt: { $max: '$visitedAt' }
      }
    }
  ]);

  const dailyPromise = Visit.aggregate([
    { $match: { url: { $in: urlIds } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$visitedAt', timezone: 'UTC' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const topUrlsPromise = Visit.aggregate([
    { $match: { url: { $in: urlIds } } },
    { $group: { _id: '$url', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'urls',
        localField: '_id',
        foreignField: '_id',
        as: 'url'
      }
    },
    { $unwind: '$url' },
    {
      $project: {
        id: { $toString: '$_id' },
        shortCode: '$url.shortCode',
        longUrl: '$url.longUrl',
        clicks: 1
      }
    }
  ]);

  const recentVisitsPromise = Visit.aggregate([
    { $match: { url: { $in: urlIds } } },
    { $sort: { visitedAt: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'urls',
        localField: 'url',
        foreignField: '_id',
        as: 'url'
      }
    },
    { $unwind: '$url' },
    {
      $project: {
        visitedAt: 1,
        referrer: 1,
        ipAddress: 1,
        userAgent: 1,
        urlId: { $toString: '$url._id' },
        shortCode: '$url.shortCode',
        longUrl: '$url.longUrl'
      }
    }
  ]);

  const [summaryResults, dailyResults, topUrls, recentVisits] = await Promise.all([
    summaryPromise,
    dailyPromise,
    topUrlsPromise,
    recentVisitsPromise
  ]);

  const totalClicks = summaryResults[0]?.totalClicks || 0;
  const lastVisitedAt = summaryResults[0]?.lastVisitedAt || null;

  return {
    totalUrls: urls.length,
    activeUrls: urls.length,
    totalClicks,
    lastVisitedAt,
    dailyClickCounts: normalizeDailyCounts(dailyResults, days),
    topUrls,
    recentVisits: recentVisits.map((visit) => ({
      visitedAt: visit.visitedAt,
      urlId: visit.urlId,
      shortCode: visit.shortCode,
      longUrl: visit.longUrl,
      referrer: visit.referrer || null,
      ipAddress: visit.ipAddress || null,
      userAgent: visit.userAgent || null
    }))
  };
}

module.exports = { getUrlAnalytics, getUserAnalytics };
