const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  ticketCode: { type: String, required: true },
  event: { type: String, required: true }, // e.g., TICKET_CREATED, AI_CLASSIFIED, ROUTED_TO_TEAM, AGENT_ASSIGNED, RAG_RETRIEVED, DRAFT_GENERATED, RESPONSE_EDITED, RESPONSE_APPROVED, STATUS_CHANGED
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: 'SYSTEM_AI' },
    role: { type: String, default: 'SYSTEM' },
  },
  details: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
