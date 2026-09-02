const express = require('express');
const router = express.Router();
const { analyzeTicket, recommendResolution, draftResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/tickets/:id/analyze', protect, analyzeTicket);
router.post('/tickets/:id/recommend', protect, recommendResolution);
router.post('/tickets/:id/draft', protect, draftResponse);

module.exports = router;
