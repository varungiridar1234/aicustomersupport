const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  approveDraft,
  rejectDraft,
  resolveTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// Public ingestion endpoint
router.post('/', createTicket);

// Authenticated ticket endpoints
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketById);
router.patch('/:id/status', protect, updateTicketStatus);
router.post('/:id/approve', protect, approveDraft);
router.post('/:id/reject', protect, rejectDraft);
router.post('/:id/resolve', protect, resolveTicket);

module.exports = router;
