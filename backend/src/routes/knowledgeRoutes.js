const express = require('express');
const router = express.Router();
const { getKnowledgeDocuments, createKnowledgeDocument, deleteKnowledgeDocument } = require('../controllers/knowledgeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getKnowledgeDocuments);
router.post('/', protect, authorize('ADMIN'), createKnowledgeDocument);
router.delete('/:id', protect, authorize('ADMIN'), deleteKnowledgeDocument);

module.exports = router;
