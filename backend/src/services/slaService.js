const SLARule = require('../models/SLARule');
const { SLA_DEFAULT_MINUTES, SLA_STATUSES } = require('../config/constants');

class SLAService {
  /**
   * Calculates SLA target deadline based on ticket priority
   */
  static async calculateDeadline(priority, createdTime = new Date()) {
    if (!priority) return null;

    let targetMinutes = SLA_DEFAULT_MINUTES[priority] || SLA_DEFAULT_MINUTES.Medium;

    try {
      const dbRule = await SLARule.findOne({ priority }).lean();
      if (dbRule && dbRule.targetMinutes) {
        targetMinutes = dbRule.targetMinutes;
      }
    } catch (err) {
      // Fallback to default
    }

    const deadline = new Date(createdTime.getTime() + targetMinutes * 60 * 1000);
    return deadline;
  }

  /**
   * Evaluates current SLA status for a given ticket
   */
  static evaluateSLAStatus(slaDeadline, priority, status) {
    if (!slaDeadline) return SLA_STATUSES.ON_TRACK;

    // Resolved or closed tickets retain their final status
    if (['RESOLVED', 'CLOSED'].includes(status)) {
      return SLA_STATUSES.ON_TRACK;
    }

    const now = new Date();
    const remainingMs = slaDeadline.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return SLA_STATUSES.BREACHED;
    }

    // Default warning threshold is 25% of target time remaining or 30 minutes
    const totalMinutes = SLA_DEFAULT_MINUTES[priority] || 480;
    const warningMs = Math.min(30, totalMinutes * 0.25) * 60 * 1000;

    if (remainingMs <= warningMs) {
      return SLA_STATUSES.AT_RISK;
    }

    return SLA_STATUSES.ON_TRACK;
  }

  /**
   * Formats remaining SLA time as readable string (e.g. "1h 24m remaining")
   */
  static formatRemainingTime(slaDeadline) {
    if (!slaDeadline) return 'N/A';
    const now = new Date();
    const diffMs = slaDeadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      const overMs = Math.abs(diffMs);
      const overMins = Math.floor(overMs / (1000 * 60));
      if (overMins < 60) return `Breached by ${overMins}m`;
      const overHours = Math.floor(overMins / 60);
      return `Breached by ${overHours}h ${overMins % 60}m`;
    }

    const totalMins = Math.floor(diffMs / (1000 * 60));
    if (totalMins < 60) return `${totalMins}m remaining`;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours}h ${mins}m remaining`;
  }
}

module.exports = SLAService;
