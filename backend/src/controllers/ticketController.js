const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const StateMachine = require('../services/stateMachine');
const AIService = require('../services/aiService');
const RoutingService = require('../services/routingService');
const AssignmentService = require('../services/assignmentService');
const SLAService = require('../services/slaService');
const RAGService = require('../services/ragService');
const AuditService = require('../services/auditService');
const NotificationService = require('../services/notificationService');
const { getNextTicketId } = require('../services/sequenceService');
const { STATUSES, SLA_STATUSES } = require('../config/constants');

// Helper to find ticket by ObjectId or string ticketId
const findTicketByIdOrCode = async (idOrCode) => {
  if (mongoose.Types.ObjectId.isValid(idOrCode)) {
    const t = await Ticket.findById(idOrCode)
      .populate('teamId')
      .populate('assignedAgentId', 'name email avatar role teamId');
    if (t) return t;
  }
  return await Ticket.findOne({ ticketId: idOrCode })
    .populate('teamId')
    .populate('assignedAgentId', 'name email avatar role teamId');
};

/**
 * Official External Customer Service Portal Ingestion API Endpoint
 * POST /api/tickets/external
 */
exports.createExternalTicket = async (req, res, next) => {
  try {
    // 1. Extract customer & request payload (supports nested customer object or flat structure)
    const customerObj = req.body.customer || {};
    const customerName = (customerObj.name || req.body.customerName || req.body.name || '').trim();
    const customerEmail = (customerObj.email || req.body.customerEmail || req.body.email || '').trim();
    const customerPhone = (customerObj.phone || req.body.customerPhone || '').trim();
    const subject = (req.body.subject || '').trim();
    const message = (req.body.message || req.body.description || '').trim();
    const channel = req.body.channel || 'customer_portal';
    const source = req.body.source || 'external_customer_portal';

    // 2. Validate input fields
    if (!customerName || !customerEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Invalid request payload. 'customer.name', 'customer.email', 'subject', and 'message' are required.",
      });
    }

    // 2.5 Duplicate submission protection (prevent double-clicks within 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingRecentTicket = await Ticket.findOne({
      'customer.email': customerEmail,
      subject: subject,
      createdAt: { $gte: thirtySecondsAgo },
    });

    if (existingRecentTicket) {
      return res.status(200).json({
        success: true,
        ticketId: existingRecentTicket.ticketId,
        status: 'RECEIVED',
        message: 'Your support request has already been received.',
      });
    }

    // 3. Generate unique, atomic, persistent Ticket ID from MongoDB sequence
    const ticketId = await getNextTicketId();

    // 4. Store initial Ticket in database (Ignore untrusted client fields like priority, category, team, etc.)
    const ticket = await Ticket.create({
      ticketId,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      channel,
      source,
      subject,
      description: message,
      status: STATUSES.NEW,
    });

    // 5. Audit Log: Record TICKET_CREATED_FROM_CUSTOMER_PORTAL
    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'TICKET_CREATED_FROM_CUSTOMER_PORTAL',
      actor: { name: 'EXTERNAL_CUSTOMER_PORTAL', role: 'EXTERNAL' },
      details: `Support request received from external Customer Service Request Portal by ${customerName} (${customerEmail})`,
      metadata: { channel, source, customerEmail },
    });

    // 6. Trigger Existing AI + Routing + Assignment + SLA + RAG Pipeline safely
    try {
      // AI Classification
      const classification = await AIService.classifyTicket(subject, message);
      ticket.category = classification.category;
      ticket.priority = classification.priority;
      ticket.confidence = classification.confidence;
      ticket.classificationReason = classification.reason;
      ticket.status = STATUSES.UNCLASSIFIED;
      await ticket.save();

      await AuditService.logEvent({
        ticketId: ticket._id,
        ticketCode: ticket.ticketId,
        event: 'AI_CLASSIFIED',
        actor: null,
        details: `AI Classified as Category: ${classification.category}, Priority: ${classification.priority} (${(classification.confidence * 100).toFixed(0)}% confidence)`,
        metadata: classification,
      });

      // Routing & SLA Calculation
      const targetTeamId = await RoutingService.resolveTeam(classification.category, classification.priority);
      ticket.teamId = targetTeamId;

      const slaDeadline = await SLAService.calculateDeadline(classification.priority, ticket.createdAt);
      ticket.slaDeadline = slaDeadline;
      ticket.slaStatus = SLA_STATUSES.ON_TRACK;
      await ticket.save();

      if (targetTeamId) {
        await AuditService.logEvent({
          ticketId: ticket._id,
          ticketCode: ticket.ticketId,
          event: 'ROUTED_TO_TEAM',
          actor: null,
          details: `Routed to Team ID ${targetTeamId} based on routing matrix`,
          metadata: { teamId: targetTeamId },
        });
      }

      // Workload-Based Agent Assignment
      const assignedAgentId = await AssignmentService.assignTicketToAgent(ticket, targetTeamId);
      if (assignedAgentId) {
        ticket.assignedAgentId = assignedAgentId;
        ticket.status = STATUSES.ASSIGNED;
        await ticket.save();

        await AuditService.logEvent({
          ticketId: ticket._id,
          ticketCode: ticket.ticketId,
          event: 'AGENT_ASSIGNED',
          actor: null,
          details: `Automatically assigned to Agent ID ${assignedAgentId} based on workload score`,
          metadata: { assignedAgentId },
        });

        // Send real-time notification to agent
        await NotificationService.sendNotification({
          recipientId: assignedAgentId,
          title: `New Ticket Assigned: ${ticket.ticketId}`,
          message: `[${ticket.priority}] ${ticket.subject}`,
          type: 'ASSIGNMENT',
          ticketId: ticket._id,
          ticketCode: ticket.ticketId,
        });
      }

      // RAG Knowledge Retrieval
      const knowledgeDocs = await RAGService.retrieveRelevantKnowledge(subject, message, classification.category, 3);
      ticket.retrievedKnowledge = knowledgeDocs;

      await AuditService.logEvent({
        ticketId: ticket._id,
        ticketCode: ticket.ticketId,
        event: 'RAG_KNOWLEDGE_RETRIEVED',
        actor: null,
        details: `Retrieved ${knowledgeDocs.length} policy documents from Knowledge Base vector index`,
        metadata: { docTitles: knowledgeDocs.map(d => d.title) },
      });

      // AI Recommendation & Customer Draft Response
      const recommendations = await AIService.generateRecommendation(ticket, knowledgeDocs);
      ticket.aiRecommendation = recommendations;

      const customerDraft = await AIService.generateCustomerDraft(ticket, knowledgeDocs, recommendations);
      ticket.draftResponse = customerDraft;
      await ticket.save();

      await AuditService.logEvent({
        ticketId: ticket._id,
        ticketCode: ticket.ticketId,
        event: 'AI_RECOMMENDATION_GENERATED',
        actor: null,
        details: `AI generated step-by-step resolution plan and customer-facing draft response`,
        metadata: { draftLength: customerDraft.length },
      });

      // Broadcast real-time Socket.IO ticket event
      NotificationService.broadcastTicketUpdate({
        type: 'TICKET_CREATED',
        ticketId: ticket._id,
        ticketCode: ticket.ticketId,
      });

    } catch (aiPipelineError) {
      console.error('[createExternalTicket] Non-fatal AI/Routing pipeline error:', aiPipelineError.message);
      // Ticket remains safely stored in DB even if AI pipeline hits a temporary issue
    }

    // 7. Return Customer-Safe API Response (DO NOT expose internal prompts, keys, or stack traces)
    return res.status(201).json({
      success: true,
      ticketId: ticket.ticketId,
      status: 'RECEIVED',
      message: 'Your support request has been received.',
    });

  } catch (error) {
    console.error('[createExternalTicket] Customer request ingestion error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your support request. Please try again later.',
    });
  }
};

/**
 * Public Ticket Ingestion endpoint (Delegates to createExternalTicket)
 */
exports.createTicket = exports.createExternalTicket;

/**
 * Get List of Tickets with Filters & Live SLA Recalculation
 */
exports.getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, teamId, assignedAgentId, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (teamId) query.teamId = teamId;
    if (assignedAgentId) query.assignedAgentId = assignedAgentId;
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('teamId', 'name code color')
      .populate('assignedAgentId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Recalculate SLA statuses dynamically
    const updatedTickets = tickets.map(ticket => {
      const liveSLAStatus = SLAService.evaluateSLAStatus(
        ticket.slaDeadline ? new Date(ticket.slaDeadline) : null,
        ticket.priority,
        ticket.status
      );
      const remainingText = SLAService.formatRemainingTime(
        ticket.slaDeadline ? new Date(ticket.slaDeadline) : null
      );
      return {
        ...ticket,
        slaStatus: liveSLAStatus,
        slaRemainingText: remainingText,
      };
    });

    res.status(200).json({
      success: true,
      count: updatedTickets.length,
      tickets: updatedTickets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Ticket Details by ID
 */
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCode(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const liveSLAStatus = SLAService.evaluateSLAStatus(ticket.slaDeadline, ticket.priority, ticket.status);
    const remainingText = SLAService.formatRemainingTime(ticket.slaDeadline);

    const ticketObj = ticket.toObject();
    ticketObj.slaStatus = liveSLAStatus;
    ticketObj.slaRemainingText = remainingText;

    res.status(200).json({
      success: true,
      ticket: ticketObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Ticket Status with Backend State Machine Validation
 */
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await findTicketByIdOrCode(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Backend validates transition
    StateMachine.validateTransition(ticket.status, status);

    const previousStatus = ticket.status;
    ticket.status = status;

    if (status === STATUSES.RESOLVED) {
      ticket.resolvedAt = new Date();
    } else if (status === STATUSES.CLOSED) {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'STATUS_CHANGED',
      actor: req.user,
      details: `Status transitioned from ${previousStatus} to ${status}`,
      metadata: { previousStatus, newStatus: status },
    });

    NotificationService.broadcastTicketUpdate({
      type: 'STATUS_CHANGED',
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      status,
    });

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Human Approval: Agent Reviews, Edits, and Approves Customer Response Draft
 */
exports.approveDraft = async (req, res, next) => {
  try {
    const { editedResponse } = req.body;
    const ticket = await findTicketByIdOrCode(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const finalResponse = editedResponse ? editedResponse.trim() : ticket.draftResponse;

    ticket.approvedResponse = finalResponse;
    ticket.isDraftApproved = true;

    // Advance status to IN_PROGRESS or RESOLVED if agent approves
    if ([STATUSES.NEW, STATUSES.UNCLASSIFIED, STATUSES.ASSIGNED].includes(ticket.status)) {
      ticket.status = STATUSES.IN_PROGRESS;
    }

    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'RESPONSE_APPROVED',
      actor: req.user,
      details: `Agent ${req.user ? req.user.name : 'Human Agent'} approved final customer response draft`,
      metadata: { finalResponseLength: finalResponse.length },
    });

    // Simulate returning customer update via originating channel
    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'CUSTOMER_UPDATED',
      actor: req.user,
      details: `Customer update dispatched via originating channel: ${ticket.channel}`,
      metadata: { channel: ticket.channel, recipient: ticket.customer.email },
    });

    NotificationService.broadcastTicketUpdate({
      type: 'RESPONSE_APPROVED',
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
    });

    res.status(200).json({
      success: true,
      message: `Response approved and dispatched to customer via ${ticket.channel}`,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Human Rejection: Agent Rejects Draft Response
 */
exports.rejectDraft = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ticket = await findTicketByIdOrCode(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.isDraftApproved = false;
    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'RESPONSE_REJECTED',
      actor: req.user,
      details: `Agent ${req.user ? req.user.name : 'Human Agent'} rejected AI customer response draft. Reason: ${reason || 'Manual revision required'}`,
      metadata: { reason },
    });

    res.status(200).json({
      success: true,
      message: 'Draft response rejected. Agent may manually write or regenerate draft.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve Ticket
 */
exports.resolveTicket = async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;
    const ticket = await findTicketByIdOrCode(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Strict Linear Transformation Rule: Draft MUST be approved first!
    if (!ticket.isDraftApproved && !ticket.approvedResponse) {
      return res.status(400).json({
        success: false,
        message: 'Linear Transformation Invariant: You must review, edit, and approve the AI customer response draft before marking the ticket as RESOLVED.',
      });
    }

    // Backend validates transition (Cannot jump directly from ASSIGNED without IN_PROGRESS approval step)
    StateMachine.validateTransition(ticket.status, STATUSES.RESOLVED);

    ticket.status = STATUSES.RESOLVED;
    ticket.resolutionNotes = resolutionNotes || 'Ticket successfully resolved after agent review and customer update.';
    ticket.resolvedAt = new Date();
    await ticket.save();

    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'TICKET_RESOLVED',
      actor: req.user,
      details: `Ticket marked as RESOLVED by agent ${req.user ? req.user.name : 'System'}`,
      metadata: { resolutionNotes: ticket.resolutionNotes },
    });

    // Notify customer via channel
    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'CUSTOMER_NOTIFICATION_SENT',
      actor: null,
      details: `Final resolution notification sent to ${ticket.customer.email} via ${ticket.channel}`,
      metadata: { channel: ticket.channel },
    });

    NotificationService.broadcastTicketUpdate({
      type: 'TICKET_RESOLVED',
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
    });

    res.status(200).json({
      success: true,
      message: 'Ticket successfully resolved',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
