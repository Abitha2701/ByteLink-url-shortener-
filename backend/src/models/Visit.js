const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    url: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
    visitedAt: { type: Date, default: () => new Date(), required: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    referrer: { type: String, trim: true }
  },
  { versionKey: false }
);

visitSchema.index({ url: 1, visitedAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
