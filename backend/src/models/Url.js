const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    longUrl: { type: String, required: true, trim: true },
    shortCode: { type: String, required: true, unique: true, trim: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clicks: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Url', urlSchema);
