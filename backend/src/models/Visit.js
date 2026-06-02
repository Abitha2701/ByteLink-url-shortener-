const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    url: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
    visitedAt: { type: Date, default: () => new Date(), required: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    referrer: { type: String, trim: true },
    browser: { type: String, trim: true, default: null },
    os: { type: String, trim: true, default: null },
    device: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null }
  },
  { versionKey: false }
);

visitSchema.index({ url: 1, visitedAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
