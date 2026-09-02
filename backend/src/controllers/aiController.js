const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const AIService = require('../services/aiService');
const RAGService = require('../services/ragService');
const SLAService = require('../services/slaService');
const AuditService = require('../services/auditService');

// Helper to find ticket by ObjectId or string ticketId
const findTicketByIdOrCode = async (idOrCode) => {
  if (mongoose.Types.ObjectId.isValid(idOrCode)) {
    const t = await Ticket.findById(idOrCode);
    if (t) return t;
  }
  return await Ticket.findOne({ ticketId: idOrCode });
};

exports.analyzeTicket = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCode(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const classification = await AIService.classifyTicket(ticket.subject, ticket.description);
    
    ticket.category = classification.category;
    ticket.priority = classification.priority;
    ticket.confidence = classification.confidence;
    ticket.classificationReason = classification.reason;

    // Recalculate SLA deadline based on classification priority
    const slaDeadline = await SLAService.calculateDeadline(classification.priority, ticket.createdAt);
    ticket.slaDeadline = slaDeadline;

    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'AI_REANALYZED',
      actor: req.user,
      details: `Re-ran AI classification: Category=${classification.category}, Priority=${classification.priority} (${(classification.confidence * 100).toFixed(0)}% confidence)`,
      metadata: classification,
    });

    res.status(200).json({ success: true, classification, ticket });
  } catch (error) {
    next(error);
  }
};

exports.recommendResolution = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCode(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const knowledgeDocs = await RAGService.retrieveRelevantKnowledge(ticket.subject, ticket.description, ticket.category, 3);
    ticket.retrievedKnowledge = knowledgeDocs;

    const recommendations = await AIService.generateRecommendation(ticket, knowledgeDocs);
    ticket.aiRecommendation = recommendations;
    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'RECOMMENDATION_REGENERATED',
      actor: req.user,
      details: 'Regenerated step-by-step resolution recommendation with updated policy context',
    });

    res.status(200).json({ success: true, recommendations, knowledgeDocs, ticket });
  } catch (error) {
    next(error);
  }
};

exports.draftResponse = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCode(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const knowledgeDocs = ticket.retrievedKnowledge || [];
    const draft = await AIService.generateCustomerDraft(ticket, knowledgeDocs, ticket.aiRecommendation);
    
    ticket.draftResponse = draft;
    ticket.isDraftApproved = false;
    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'DRAFT_REGENERATED',
      actor: req.user,
      details: 'Regenerated customer-facing response draft using AI',
    });

    res.status(200).json({ success: true, draftResponse: draft, ticket });
  } catch (error) {
    next(error);
  }
};
