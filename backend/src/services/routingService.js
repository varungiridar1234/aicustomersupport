const RoutingRule = require('../models/RoutingRule');
const Team = require('../models/Team');

class RoutingService {
  /**
   * Deterministically resolves target team for a ticket based on category and priority
   */
  static async resolveTeam(category, priority) {
    if (!category) return null;

    // 1. Check database routing rules first (Priority specific rules first, then category rules)
    const activeRules = await RoutingRule.find({ isActive: true }).lean();
    
    // Priority specific match first
    let matchedRule = activeRules.find(r => r.category === category && r.priority === priority);
    
    // If no priority match, find category match with null priority
    if (!matchedRule) {
      matchedRule = activeRules.find(r => r.category === category && !r.priority);
    }

    if (matchedRule && matchedRule.teamId) {
      return matchedRule.teamId;
    }

    // 2. Fallback to default team code matching
    const categoryToTeamCode = {
      Payment: 'BILLING',
      Technical: 'TECH',
      Delivery: 'LOGISTICS',
      Account: 'ACCOUNT',
      Security: 'SECURITY',
      Other: 'TECH',
    };

    const teamCode = categoryToTeamCode[category] || 'TECH';
    const team = await Team.findOne({ code: teamCode }).lean();
    return team ? team._id : null;
  }
}

module.exports = RoutingService;
