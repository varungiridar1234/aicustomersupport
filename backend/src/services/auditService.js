const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Logs an immutable audit record for a ticket event
   */
  static async logEvent({ ticketId, ticketCode, event, actor = null, details, metadata = {} }) {
    try {
      const log = await AuditLog.create({
        ticketId,
        ticketCode,
        event,
        actor: {
          id: actor ? actor._id || actor.id : null,
          name: actor ? actor.name : 'SYSTEM_AI',
          role: actor ? actor.role : 'SYSTEM',
        },
        details,
        metadata,
        timestamp: new Date(),
      });
      return log;
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err.message);
      return null;
    }
  }

  /**
   * Retrieves full audit trail history for a ticket ordered chronologically
   */
  static async getTicketAuditTrail(ticketId) {
    return await AuditLog.find({ ticketId })
      .sort({ timestamp: 1 })
      .lean();
  }
}

module.exports = AuditService;
