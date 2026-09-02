module.exports = {
  ROLES: {
    CUSTOMER: 'CUSTOMER',
    AGENT: 'AGENT',
    ADMIN: 'ADMIN',
  },
  CHANNELS: {
    EMAIL: 'Email',
    WHATSAPP: 'WhatsApp',
    CHATBOT: 'Chatbot',
    WEB_FORM: 'Web Form',
    CUSTOMER_PORTAL: 'customer_portal',
  },
  CATEGORIES: {
    PAYMENT: 'Payment',
    TECHNICAL: 'Technical',
    DELIVERY: 'Delivery',
    ACCOUNT: 'Account',
    SECURITY: 'Security',
    OTHER: 'Other',
  },
  PRIORITIES: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  },
  PRIORITY_WEIGHTS: {
    Low: 1,
    Medium: 2,
    High: 4,
    Critical: 8,
  },
  SLA_DEFAULT_MINUTES: {
    Critical: 30,     // 30 minutes
    High: 120,        // 2 hours
    Medium: 480,      // 8 hours
    Low: 1440,        // 24 hours
  },
  STATUSES: {
    NEW: 'NEW',
    UNCLASSIFIED: 'UNCLASSIFIED',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING_FOR_CUSTOMER: 'WAITING_FOR_CUSTOMER',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
  },
  SLA_STATUSES: {
    ON_TRACK: 'ON_TRACK',
    AT_RISK: 'AT_RISK',
    BREACHED: 'BREACHED',
  },
  VALID_TRANSITIONS: {
    NEW: ['UNCLASSIFIED'],
    UNCLASSIFIED: ['ASSIGNED'],
    ASSIGNED: ['IN_PROGRESS'],
    IN_PROGRESS: ['WAITING_FOR_CUSTOMER', 'RESOLVED'],
    WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'RESOLVED'],
    RESOLVED: ['CLOSED', 'IN_PROGRESS'],
    CLOSED: [],
  }
};
