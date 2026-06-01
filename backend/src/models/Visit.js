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

module.exports = mongoose.model('Visit', visitSchema);
