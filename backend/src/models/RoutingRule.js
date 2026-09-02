const mongoose = require('mongoose');
const { CATEGORIES, PRIORITIES } = require('../config/constants');

const routingRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: Object.values(CATEGORIES), required: true },
  priority: { type: String, enum: Object.values(PRIORITIES), default: null }, // Null means applies to all priorities
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('RoutingRule', routingRuleSchema);
