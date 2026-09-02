const { STATUSES, VALID_TRANSITIONS } = require('../config/constants');

class StateMachine {
  /**
   * Validates if state transition from currentState to targetState is allowed
   */
  static isValidTransition(currentState, targetState) {
    if (!currentState || !targetState) return false;
    if (currentState === targetState) return true;
    
    const allowed = VALID_TRANSITIONS[currentState];
    return allowed ? allowed.includes(targetState) : false;
  }

  /**
   * Validates state transition or throws descriptive error
   */
  static validateTransition(currentState, targetState) {
    if (!this.isValidTransition(currentState, targetState)) {
      throw new Error(`Invalid state transition from '${currentState}' to '${targetState}'. Valid transitions are: ${(VALID_TRANSITIONS[currentState] || []).join(', ') || 'None'}`);
    }
    return true;
  }
}

module.exports = StateMachine;
