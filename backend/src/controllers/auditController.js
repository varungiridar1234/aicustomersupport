const mongoose = require('mongoose');
const AuditService = require('../services/auditService');
const Ticket = require('../models/Ticket');

exports.getTicketAuditTrail = async (req, res, next) => {
  try {
    let { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      const ticket = await Ticket.findOne({ ticketId });
      if (ticket) ticketId = ticket._id;
    }

    const logs = await AuditService.getTicketAuditTrail(ticketId);
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};
