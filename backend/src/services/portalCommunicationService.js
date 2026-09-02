const AuditService = require('./auditService');
const NotificationService = require('./notificationService');

/**
 * Portal Communication Service
 * Manages two-way outgoing notifications and conversation thread history
 * between the Resolution System and the Customer Support Request Portal.
 */
class PortalCommunicationService {
  /**
   * Dispatches an outgoing customer notification/message back to the Customer Support Request Portal.
   * Enforces notification deduplication, records message thread history, and broadcasts real-time Socket events.
   */
  async dispatchPortalNotification({
    ticket,
    eventType,
    messageContent,
    sender = 'SYSTEM',
    senderName = 'ResolvAI Support System',
    isCustomerVisible = true,
    metadata = {},
  }) {
    if (!ticket || !eventType || !messageContent) {
      return null;
    }

    // 1. Notification Deduplication Signature Check
    const deduplicationSignature = `${eventType}:${ticket.status}:${metadata.status || ''}`;
    const alreadyDispatched = ticket.dispatchedNotifications?.some(
      (n) => n.eventType === deduplicationSignature
    );

    if (alreadyDispatched) {
      console.log(`[PortalCommunicationService] Suppressing duplicate notification for event: ${deduplicationSignature}`);
      return null;
    }

    // 2. Append message to ticket conversation thread
    const messageEntry = {
      sender,
      senderName,
      content: messageContent.trim(),
      isCustomerVisible,
      channel: ticket.channel || 'customer_portal',
      eventType,
      timestamp: new Date(),
      deliveryStatus: 'DELIVERED',
    };

    if (!ticket.messages) {
      ticket.messages = [];
    }
    ticket.messages.push(messageEntry);

    // 3. Record deduplication signature
    if (!ticket.dispatchedNotifications) {
      ticket.dispatchedNotifications = [];
    }
    ticket.dispatchedNotifications.push({
      eventType: deduplicationSignature,
      dispatchedAt: new Date(),
    });

    await ticket.save();

    // 4. Record Audit Log Event
    await AuditService.logEvent({
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      event: 'OUTGOING_PORTAL_COMMUNICATION_DISPATCHED',
      actor: { name: senderName, role: sender },
      details: `Outgoing ${eventType} notification dispatched to Customer Support Request Portal for ${ticket.customer.email}`,
      metadata: { eventType, sender, channel: ticket.channel, customerEmail: ticket.customer.email },
    });

    // 5. Broadcast Real-Time Socket.IO Notification to Portal & Agent Dashboards
    NotificationService.broadcastTicketUpdate({
      type: 'CUSTOMER_PORTAL_NOTIFICATION',
      ticketId: ticket._id,
      ticketCode: ticket.ticketId,
      eventType,
      message: messageEntry,
      status: ticket.status,
    });

    return messageEntry;
  }
}

module.exports = new PortalCommunicationService();
