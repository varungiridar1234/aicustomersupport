const mongoose = require('mongoose');
const { CHANNELS, CATEGORIES, PRIORITIES, STATUSES, SLA_STATUSES } = require('../config/constants');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
  },
  channel: { type: String, default: 'customer_portal' },
  source: { type: String, default: 'external_customer_portal' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  
  // AI Classification
  category: { type: String, enum: [...Object.values(CATEGORIES), null], default: null },
  priority: { type: String, enum: [...Object.values(PRIORITIES), null], default: null },
  confidence: { type: Number, default: 0 },
  classificationReason: { type: String, default: '' },
  
  // Lifecycle & Routing
  status: { type: String, enum: Object.values(STATUSES), default: STATUSES.NEW },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // SLA
  slaDeadline: { type: Date, default: null },
  slaStatus: { type: String, enum: Object.values(SLA_STATUSES), default: SLA_STATUSES.ON_TRACK },
  slaBreachedAt: { type: Date, default: null },
  
  // AI Grounded Recommendations & Response Drafts
  retrievedKnowledge: [{
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeDocument' },
    title: String,
    score: Number,
    excerpt: String,
  }],
  aiRecommendation: [{
    step: Number,
    action: String,
    detail: String,
  }],
  draftResponse: { type: String, default: '' },
  approvedResponse: { type: String, default: '' },
  isDraftApproved: { type: Boolean, default: false },
  
  // Resolution details
  resolutionNotes: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null },
}, { timestamps: true });

ticketSchema.index({ status: 1, priority: 1, assignedAgentId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
