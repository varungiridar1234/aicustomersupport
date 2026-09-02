const mongoose = require('mongoose');
const { PRIORITIES } = require('../config/constants');

const slaRuleSchema = new mongoose.Schema({
  priority: { type: String, enum: Object.values(PRIORITIES), required: true, unique: true },
  targetMinutes: { type: Number, required: true }, // Minutes to resolution
  warningThresholdMinutes: { type: Number, required: true }, // Minutes remaining to trigger AT_RISK status
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SLARule', slaRuleSchema);
