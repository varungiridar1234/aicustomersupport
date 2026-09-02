const express = require('express');
const router = express.Router();
const {
  getTeams,
  createTeam,
  getAgents,
  getRoutingRules,
  createRoutingRule,
  deleteRoutingRule,
  getSLARules,
  updateSLARule,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Admin protected routes
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/teams', getTeams);
router.post('/teams', createTeam);

router.get('/agents', getAgents);

router.get('/routing-rules', getRoutingRules);
router.post('/routing-rules', createRoutingRule);
router.delete('/routing-rules/:id', deleteRoutingRule);

router.get('/sla-rules', getSLARules);
router.patch('/sla-rules/:priority', updateSLARule);

module.exports = router;
