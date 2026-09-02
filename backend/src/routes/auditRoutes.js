const express = require('express');
const router = express.Router();
const { getTicketAuditTrail } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

router.get('/tickets/:ticketId/audit', protect, getTicketAuditTrail);

module.exports = router;
