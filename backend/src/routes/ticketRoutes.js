const express = require('express');
const router = express.Router();
const {
  createExternalTicket,
  getExternalTicketThread,
  addCustomerReply,
  getTickets,
  getTicketById,
  updateTicketStatus,
  approveDraft,
  rejectDraft,
  resolveTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// Official External Customer Portal Endpoints (Public)
router.post('/external', createExternalTicket);
router.get('/external/:id/thread', getExternalTicketThread);
router.post('/external/:id/reply', addCustomerReply);

// Internal fallback route
router.post('/', createExternalTicket);

// Authenticated internal ticket endpoints
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketById);
router.patch('/:id/status', protect, updateTicketStatus);
router.post('/:id/approve', protect, approveDraft);
router.post('/:id/reject', protect, rejectDraft);
router.post('/:id/resolve', protect, resolveTicket);

module.exports = router;
