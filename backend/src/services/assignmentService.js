const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { ROLES, PRIORITY_WEIGHTS, STATUSES } = require('../config/constants');

class AssignmentService {
  /**
   * Calculates workload score for a single agent based on active assigned tickets
   * Workload = Sum(Ticket Priority Weight)
   */
  static async calculateAgentWorkload(agentId) {
    const activeTickets = await Ticket.find({
      assignedAgentId: agentId,
      status: { $in: [STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.WAITING_FOR_CUSTOMER] }
    }).select('priority').lean();

    let score = 0;
    activeTickets.forEach(ticket => {
      const weight = PRIORITY_WEIGHTS[ticket.priority] || 1;
      score += weight;
    });

    return {
      activeTicketCount: activeTickets.length,
      workloadScore: score,
    };
  }

  /**
   * Automatically assigns ticket to eligible available agent in team with lowest workload score
   */
  static async assignTicketToAgent(ticket, teamId) {
    if (!teamId) return null;

    // Find available agents assigned to this team
    const eligibleAgents = await User.find({
      role: ROLES.AGENT,
      teamId: teamId,
      isAvailable: true,
    }).lean();

    if (!eligibleAgents || eligibleAgents.length === 0) {
      console.log(`[AssignmentService] No available agents found for team ${teamId}`);
      return null;
    }

    // Calculate workload score for each eligible agent
    const agentWorkloads = await Promise.all(
      eligibleAgents.map(async (agent) => {
        const { workloadScore, activeTicketCount } = await this.calculateAgentWorkload(agent._id);
        return {
          agent,
          workloadScore,
          activeTicketCount,
        };
      })
    );

    // Sort by workload score ASC, then by activeTicketCount ASC
    agentWorkloads.sort((a, b) => {
      if (a.workloadScore !== b.workloadScore) {
        return a.workloadScore - b.workloadScore;
      }
      return a.activeTicketCount - b.activeTicketCount;
    });

    const selectedAgent = agentWorkloads[0].agent;
    console.log(`[AssignmentService] Assigned ticket ${ticket.ticketId} to agent ${selectedAgent.name} (Workload Score: ${agentWorkloads[0].workloadScore})`);
    
    return selectedAgent._id;
  }
}

module.exports = AssignmentService;
