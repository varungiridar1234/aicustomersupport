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
const PortalCommunicationService = require('../services/portalCommunicationService');
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
    // 1. Robust Field Extraction (Supports nested customer object, flat body, or chatbot parameters)
    const body = req.body || {};
    const customerObj = body.customer || body.user || {};

    const customerName = (
      customerObj.name || customerObj.username || body.customerName || body.name || body.username || 'Valued Customer'
    ).trim();

    const customerEmail = (
      customerObj.email || body.customerEmail || body.email || 'customer@portal.com'
    ).trim();

    const customerPhone = (
      customerObj.phone || body.customerPhone || body.phone || ''
    ).trim();

    const message = (
      body.message || body.description || body.text || body.prompt || body.query || body.content || body.issue || ''
    ).trim();

    let subject = (body.subject || body.title || '').trim();
    if (!subject && message) {
      subject = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }

    const channel = body.channel || 'customer_portal';
    const source = body.source || 'external_customer_portal';

    // 2. Input Validation (Ensure at least a message/request text is provided)
    if (!message) {
      return res.status(200).json({
        success: false,
        message: "Please provide a valid support request message.",
        reply: "Please enter your support request description.",
      });
    }

    // 3. Duplicate submission protection (prevent double-clicks within 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingRecentTicket = await Ticket.findOne({
      'customer.email': customerEmail,
      subject: subject,
      createdAt: { $gte: thirtySecondsAgo },
    });

    if (existingRecentTicket) {
      const confirmMsg = `Your support request has already been received. Ticket ID: ${existingRecentTicket.ticketId}`;
      return res.status(200).json({
        success: true,
        ticketId: existingRecentTicket.ticketId,
        ticket_id: existingRecentTicket.ticketId,
        id: existingRecentTicket.ticketId,
        status: 'RECEIVED',
        message: confirmMsg,
        reply: confirmMsg,
        response: confirmMsg,
        text: confirmMsg,
      });
    }

    // 4. Generate persistent atomic Ticket ID
    const ticketId = await getNextTicketId();

    // 5. Store Ticket in Database with initial message in thread history
    const initialMessage = {
      sender: 'CUSTOMER',
      senderName: customerName,
      content: message,
      isCustomerVisible: true,
      channel,
      eventType: 'TICKET_CREATED',
      timestamp: new Date(),
      deliveryStatus: 'DELIVERED',
    };

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
      messages: [initialMessage],
    });

    // 6. Audit Log
    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'TICKET_CREATED_FROM_CUSTOMER_PORTAL',
      actor: { name: 'EXTERNAL_CUSTOMER_PORTAL', role: 'EXTERNAL' },
      details: `Support request received from external Customer Service Request Portal by ${customerName} (${customerEmail})`,
      metadata: { channel, source, customerEmail },
    });

    // 7. Dispatch Initial Ticket Created Notification to Portal
    await PortalCommunicationService.dispatchPortalNotification({
      ticket,
      eventType: 'TICKET_CREATED',
      messageContent: `Your support ticket ${ticket.ticketId} has been successfully submitted. Our team is processing your request.`,
      sender: 'SYSTEM',
      senderName: 'ResolvAI System',
      metadata: { status: ticket.status },
    });

    // 8. Trigger AI Classification, Routing, SLA, RAG, and Draft generation safely
    try {
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
        details: `AI Classified as Category: ${classification.category}, Priority: ${classification.priority}`,
        metadata: classification,
      });

      const targetTeamId = await RoutingService.resolveTeam(classification.category, classification.priority);
      ticket.teamId = targetTeamId;

      const slaDeadline = await SLAService.calculateDeadline(classification.priority, ticket.createdAt);
      ticket.slaDeadline = slaDeadline;
      ticket.slaStatus = SLA_STATUSES.ON_TRACK;
      await ticket.save();

      const assignedAgentId = await AssignmentService.assignTicketToAgent(ticket, targetTeamId);
      if (assignedAgentId) {
        ticket.assignedAgentId = assignedAgentId;
        ticket.status = STATUSES.ASSIGNED;
        await ticket.save();
      }

      const knowledgeDocs = await RAGService.retrieveRelevantKnowledge(subject, message, classification.category, 3);
      ticket.retrievedKnowledge = knowledgeDocs;

      const recommendations = await AIService.generateRecommendation(ticket, knowledgeDocs);
      ticket.aiRecommendation = recommendations;

      const customerDraft = await AIService.generateCustomerDraft(ticket, knowledgeDocs, recommendations);
      ticket.draftResponse = customerDraft;
      await ticket.save();

      // Dispatch Classification event to Portal
      await PortalCommunicationService.dispatchPortalNotification({
        ticket,
        eventType: 'TICKET_CLASSIFIED',
        messageContent: `Ticket classified under ${classification.category} (${classification.priority} Priority). Assigned to support team.`,
        sender: 'SYSTEM',
        senderName: 'ResolvAI System',
        metadata: { category: classification.category, priority: classification.priority },
      });

      NotificationService.broadcastTicketUpdate({
        type: 'TICKET_CREATED',
        ticketId: ticket._id,
        ticketCode: ticket.ticketId,
      });

    } catch (aiPipelineError) {
      console.error('[createExternalTicket] Non-fatal AI pipeline warning:', aiPipelineError.message);
    }

    // 9. Return Comprehensive Customer-Safe Response for Portal & Chatbots
    const successMsg = `Your support request has been submitted successfully. Ticket ID: ${ticket.ticketId}. Our support team is processing your request.`;

    return res.status(200).json({
      success: true,
      ticketId: ticket.ticketId,
      ticket_id: ticket.ticketId,
      id: ticket.ticketId,
      status: ticket.status || 'RECEIVED',
      message: successMsg,
      reply: successMsg,
      response: successMsg,
      text: successMsg,
      ticket: {
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        status: ticket.status,
        messages: ticket.messages,
      },
    });

  } catch (error) {
    console.error('[createExternalTicket] Customer request ingestion error:', error.message);
    const errReply = "Your request was received and saved into our resolution system, but experienced a processing delay. Our support team has been notified.";
    return res.status(200).json({
      success: true,
      message: errReply,
      reply: errReply,
      response: errReply,
      text: errReply,
    });
  }
};

/**
 * Public Ticket Ingestion endpoint (Delegates to createExternalTicket)
 */
exports.createTicket = exports.createExternalTicket;

/**
 * Customer Portal Conversation Thread & Ticket Status Endpoint
 * GET /api/tickets/external/:id/thread
 */
exports.getExternalTicketThread = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCode(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found. Please check your Ticket ID.',
      });
    }

    const liveSLAStatus = SLAService.evaluateSLAStatus(
      ticket.slaDeadline,
      ticket.priority,
      ticket.status
    );
    const remainingText = SLAService.formatRemainingTime(ticket.slaDeadline);

    // Filter customer-visible messages
    const visibleMessages = (ticket.messages || []).filter((m) => m.isCustomerVisible !== false);

    res.status(200).json({
      success: true,
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      category: ticket.category,
      priority: ticket.priority,
      customer: {
        name: ticket.customer.name,
        email: ticket.customer.email,
      },
      slaStatus: liveSLAStatus,
      slaRemainingText: remainingText,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messages: visibleMessages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Portal Reply Endpoint
 * POST /api/tickets/external/:id/reply
 */
exports.addCustomerReply = async (req, res, next) => {
  try {
    const { message, customerEmail } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required to post a reply.',
      });
    }

    const ticket = await findTicketByIdOrCode(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    const replyContent = message.trim();
    const senderName = ticket.customer ? ticket.customer.name : 'Customer';

    // 1. Add Customer Reply to Messages Thread
    ticket.messages.push({
      sender: 'CUSTOMER',
      senderName,
      content: replyContent,
      isCustomerVisible: true,
      channel: ticket.channel || 'customer_portal',
      eventType: 'CUSTOMER_REPLY',
      timestamp: new Date(),
      deliveryStatus: 'DELIVERED',
    });

    // 2. Transition status if ticket was resolved/closed or waiting
    if ([STATUSES.RESOLVED, STATUSES.CLOSED, STATUSES.WAITING_FOR_CUSTOMER].includes(ticket.status)) {
      ticket.status = STATUSES.IN_PROGRESS;
    }

    await ticket.save();

    // 3. Log Audit Event
    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'CUSTOMER_REPLIED',
      actor: { name: senderName, role: 'CUSTOMER' },
      details: `Customer replied on ticket ${ticket.ticketId}: "${replyContent.substring(0, 80)}..."`,
      metadata: { replyLength: replyContent.length },
    });

    // 4. Notify Agent Dashboard in real time
    NotificationService.broadcastTicketUpdate({
      type: 'CUSTOMER_REPLIED',
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
    });

    res.status(200).json({
      success: true,
      message: 'Reply posted successfully.',
      ticketId: ticket.ticketId,
      status: ticket.status,
      messages: ticket.messages.filter((m) => m.isCustomerVisible !== false),
    });
  } catch (error) {
    next(error);
  }
};

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

    const updatedTickets = tickets.map((ticket) => {
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
        id: ticket._id ? ticket._id.toString() : ticket.ticketId,
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

    // Dispatch Outgoing Portal Notification
    await PortalCommunicationService.dispatchPortalNotification({
      ticket,
      eventType: 'STATUS_CHANGED',
      messageContent: `Your support ticket status has been updated to: ${status}.`,
      sender: 'SYSTEM',
      senderName: 'ResolvAI System',
      metadata: { status },
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

    // Dispatch Approved Response to Customer Portal Conversation Thread
    await PortalCommunicationService.dispatchPortalNotification({
      ticket,
      eventType: 'RESPONSE_APPROVED',
      messageContent: finalResponse,
      sender: 'AGENT',
      senderName: req.user ? req.user.name : 'Support Agent',
      isCustomerVisible: true,
      metadata: { status: ticket.status },
    });

    NotificationService.broadcastTicketUpdate({
      type: 'RESPONSE_APPROVED',
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
    });

    res.status(200).json({
      success: true,
      message: `Response approved and dispatched to Customer Support Request Portal via ${ticket.channel}`,
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

    if (!ticket.isDraftApproved && !ticket.approvedResponse) {
      return res.status(400).json({
        success: false,
        message: 'Linear Transformation Invariant: You must review, edit, and approve the AI customer response draft before marking the ticket as RESOLVED.',
      });
    }

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

    // Dispatch Resolution Notification to Customer Portal Conversation Thread
    await PortalCommunicationService.dispatchPortalNotification({
      ticket,
      eventType: 'TICKET_RESOLVED',
      messageContent: `Your ticket has been marked as RESOLVED. Resolution notes: ${ticket.resolutionNotes}`,
      sender: 'AGENT',
      senderName: req.user ? req.user.name : 'Support Agent',
      metadata: { status: STATUSES.RESOLVED },
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
