const Team = require('../models/Team');
const User = require('../models/User');
const RoutingRule = require('../models/RoutingRule');
const SLARule = require('../models/SLARule');
const AssignmentService = require('../services/assignmentService');
const { ROLES } = require('../config/constants');

// Teams
exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.status(200).json({ success: true, teams });
  } catch (error) { next(error); }
};

exports.createTeam = async (req, res, next) => {
  try {
    const { name, code, description, color } = req.body;
    const team = await Team.create({ name, code, description, color });
    res.status(201).json({ success: true, team });
  } catch (error) { next(error); }
};

// Agents & Workloads
exports.getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: ROLES.AGENT }).populate('teamId').select('-password').lean();
    
    // Calculate live workload scores
    const agentsWithWorkloads = await Promise.all(
      agents.map(async (agent) => {
        const { workloadScore, activeTicketCount } = await AssignmentService.calculateAgentWorkload(agent._id);
        return {
          ...agent,
          workloadScore,
          activeTicketCount,
        };
      })
    );

    res.status(200).json({ success: true, agents: agentsWithWorkloads });
  } catch (error) { next(error); }
};

// Routing Rules
exports.getRoutingRules = async (req, res, next) => {
  try {
    const rules = await RoutingRule.find().populate('teamId').sort({ category: 1 });
    res.status(200).json({ success: true, rules });
  } catch (error) { next(error); }
};

exports.createRoutingRule = async (req, res, next) => {
  try {
    const { name, category, priority, teamId, description } = req.body;
    const rule = await RoutingRule.create({ name, category, priority: priority || null, teamId, description });
    res.status(201).json({ success: true, rule });
  } catch (error) { next(error); }
};

exports.deleteRoutingRule = async (req, res, next) => {
  try {
    await RoutingRule.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Routing rule deleted' });
  } catch (error) { next(error); }
};

// SLA Rules
exports.getSLARules = async (req, res, next) => {
  try {
    const rules = await SLARule.find().sort({ targetMinutes: 1 });
    res.status(200).json({ success: true, rules });
  } catch (error) { next(error); }
};

exports.updateSLARule = async (req, res, next) => {
  try {
    const { targetMinutes, warningThresholdMinutes, description } = req.body;
    const rule = await SLARule.findOneAndUpdate(
      { priority: req.params.priority },
      { targetMinutes, warningThresholdMinutes, description },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, rule });
  } catch (error) { next(error); }
};
