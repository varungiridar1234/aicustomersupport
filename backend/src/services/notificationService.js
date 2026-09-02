const Notification = require('../models/Notification');

let ioInstance = null;

class NotificationService {
  static init(io) {
    ioInstance = io;
    console.log('[NotificationService] Socket.IO initialized');
  }

  /**
   * Sends real-time notification to a specific agent and creates database record
   */
  static async sendNotification({ recipientId, title, message, type = 'ASSIGNMENT', ticketId = null, ticketCode = '' }) {
    try {
      // 1. Create DB notification
      const notification = await Notification.create({
        recipientId,
        title,
        message,
        type,
        ticketId,
        ticketCode,
      });

      // 2. Broadcast via Socket.IO if recipient room is connected
      if (ioInstance) {
        ioInstance.to(`user:${recipientId}`).emit('notification', notification);
        ioInstance.emit('ticket_updated', { ticketId, type, message });
      }

      return notification;
    } catch (err) {
      console.error('[NotificationService] Error sending notification:', err.message);
      return null;
    }
  }

  /**
   * Broadcasts general ticket update event to all connected dashboard clients
   */
  static broadcastTicketUpdate(eventData) {
    if (ioInstance) {
      ioInstance.emit('ticket_event', eventData);
    }
  }
}

module.exports = NotificationService;
