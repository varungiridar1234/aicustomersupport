require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Ticket = require('../src/models/Ticket');
const RoutingRule = require('../src/models/RoutingRule');
const SLARule = require('../src/models/SLARule');
const KnowledgeDocument = require('../src/models/KnowledgeDocument');
const AuditLog = require('../src/models/AuditLog');
const Notification = require('../src/models/Notification');
const { ROLES, CHANNELS, CATEGORIES, PRIORITIES, STATUSES, SLA_STATUSES } = require('../src/config/constants');

const seedData = async (skipDisconnect = false) => {
  console.log('[Seed] Starting database seed process...');
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Ticket.deleteMany({}),
    RoutingRule.deleteMany({}),
    SLARule.deleteMany({}),
    KnowledgeDocument.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing database records.');

  // 1. Seed Teams
  const teams = await Team.insertMany([
    { name: 'Billing', code: 'BILLING', description: 'Handles payments, refunds, invoices & duplicate charges', color: '#10b981' },
    { name: 'Technical Support', code: 'TECH', description: 'Handles server issues, bugs, and API integration errors', color: '#6366f1' },
    { name: 'Logistics', code: 'LOGISTICS', description: 'Handles shipping, delays, package tracking and delivery', color: '#f59e0b' },
    { name: 'Account Support', code: 'ACCOUNT', description: 'Handles user profiles, logins, and password resets', color: '#8b5cf6' },
    { name: 'Security', code: 'SECURITY', description: 'Handles suspicious logins, breaches, and account protection', color: '#ef4444' },
  ]);

  const teamMap = {};
  teams.forEach(t => { teamMap[t.code] = t._id; });

  // 2. Seed Department Users
  const admin = await User.create({
    name: 'Sarah Connor (System Admin)',
    email: 'admin@support.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  });

  const billingAgent1 = await User.create({
    name: 'Alex Rivera (Billing Lead)',
    email: 'billing.agent@support.com',
    password: 'billing123',
    role: ROLES.AGENT,
    teamId: teamMap['BILLING'],
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const billingAgent2 = await User.create({
    name: 'Marcus Vance (Billing Senior)',
    email: 'billing.busy@support.com',
    password: 'billing123',
    role: ROLES.AGENT,
    teamId: teamMap['BILLING'],
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  const techAgent = await User.create({
    name: 'Elena Rostova (Tech Lead)',
    email: 'tech.agent@support.com',
    password: 'tech123',
    role: ROLES.AGENT,
    teamId: teamMap['TECH'],
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  });

  const logisticsAgent = await User.create({
    name: 'Carlos Ruiz (Logistics Lead)',
    email: 'logistics.agent@support.com',
    password: 'logistics123',
    role: ROLES.AGENT,
    teamId: teamMap['LOGISTICS'],
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  });

  const securityAgent = await User.create({
    name: 'David K. (Security Lead)',
    email: 'security.agent@support.com',
    password: 'security123',
    role: ROLES.AGENT,
    teamId: teamMap['SECURITY'],
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  });

  const accountAgent = await User.create({
    name: 'Priya Sharma (Account Lead)',
    email: 'account.agent@support.com',
    password: 'account123',
    role: ROLES.AGENT,
    teamId: teamMap['ACCOUNT'],
    isAvailable: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  });

  console.log('[Seed] Created department users (Admin & Agents).');

  // 3. Seed SLA Rules
  await SLARule.insertMany([
    { priority: PRIORITIES.CRITICAL, targetMinutes: 30, warningThresholdMinutes: 10, description: 'Critical outage or security incident' },
    { priority: PRIORITIES.HIGH, targetMinutes: 120, warningThresholdMinutes: 30, description: 'High priority billing or server bug' },
    { priority: PRIORITIES.MEDIUM, targetMinutes: 480, warningThresholdMinutes: 120, description: 'Medium priority inquiry' },
    { priority: PRIORITIES.LOW, targetMinutes: 1440, warningThresholdMinutes: 360, description: 'General feedback or low priority query' },
  ]);

  // 4. Seed Routing Rules
  await RoutingRule.insertMany([
    { name: 'Payment Issues -> Billing', category: CATEGORIES.PAYMENT, teamId: teamMap['BILLING'], description: 'All payment & refund queries' },
    { name: 'Technical Issues -> Tech Support', category: CATEGORIES.TECHNICAL, teamId: teamMap['TECH'], description: 'Server and application bugs' },
    { name: 'Delivery -> Logistics', category: CATEGORIES.DELIVERY, teamId: teamMap['LOGISTICS'], description: 'Shipping & tracking' },
    { name: 'Account -> Account Support', category: CATEGORIES.ACCOUNT, teamId: teamMap['ACCOUNT'], description: 'User login & password assistance' },
    { name: 'Security -> Security Team', category: CATEGORIES.SECURITY, teamId: teamMap['SECURITY'], description: 'Security alerts and breaches' },
  ]);

  // 5. Seed Knowledge Documents
  const knowledgeDocs = await KnowledgeDocument.insertMany([
    {
      title: 'Duplicate Payment Policy',
      category: CATEGORIES.PAYMENT,
      summary: 'Guidelines for resolving double charges and dual pending authorization holds.',
      content: `Duplicate Payment & Dual Hold Resolution SOP:
1. Verification: When a customer reports a duplicate payment, verify both transaction IDs in the merchant gateway. Confirm whether both charges reference the same Order ID.
2. Hold vs Posted: Check if one transaction is an authorization hold or a posted settlement. Authorization holds release automatically within 3 to 5 business days.
3. Refund Execution: If two posted settlements exist for a single order, immediately process a direct refund for the duplicate charge via the billing panel.
4. Customer Communication: Inform the customer that the duplicate transaction refund has been submitted and expect posting within 2-3 banking days.`,
      tags: ['duplicate', 'payment', 'charge', 'refund', 'billing'],
    },
    {
      title: 'Refund Policy & SLA Standard',
      category: CATEGORIES.PAYMENT,
      summary: 'Company standard policy governing eligible refunds and credit card chargeback prevention.',
      content: `Standard Refund Policy Guidelines:
- Full refunds are permitted within 30 days of purchase for unused service credits or verified billing errors.
- System glitches resulting in multiple billing charges qualify for instant full refund without restocking fees.
- Refund processing takes 3-5 business days to reflect on the customer's bank statement depending on card issuer.`,
      tags: ['refund', 'policy', 'billing', 'credit'],
    },
    {
      title: 'Server Troubleshooting & 500 Outage Guide',
      category: CATEGORIES.TECHNICAL,
      summary: 'Standard operating procedure for managing 500 Internal Server Errors and API downtime.',
      content: `Technical Escalation Procedure for 500 Errors:
1. Check Status Page: Inspect live health status at status.company.com.
2. Isolated vs Global: Determine if error affects a single tenant or global region.
3. Node Inspection: Inspect error logs in Datadog/Sentry for stack traces.
4. Escalation: If downtime exceeds 10 minutes, escalate ticket to Infrastructure On-Call engineer.`,
      tags: ['technical', 'server', '500', 'error', 'outage'],
    },
    {
      title: 'Security Incident & Account Safeguard Protocol',
      category: CATEGORIES.SECURITY,
      summary: 'Immediate action plan for customer account compromise or suspicious IP login attempts.',
      content: `Security Incident Procedure:
1. Freeze Account Session: Terminate all active OAuth tokens and sessions for the target email.
2. Enforce Password Reset: Trigger mandatory 2FA email reset link.
3. Audit Log Review: Inspect API access logs for unauthorized IP origins.`,
      tags: ['security', 'hacked', 'breach', 'login', 'password'],
    }
  ]);

  console.log('[Seed] Created Knowledge Base documents.');

  // 6. Primary Demo Ticket: TICK-1024 (Assigned to Alex Rivera - Medium Priority, Weight = 2)
  const primaryTicket = await Ticket.create({
    ticketId: 'TICK-1024',
    customer: {
      name: 'Robert Vance',
      email: 'robert.vance@acme.com',
      phone: '+1 (555) 234-5678',
    },
    channel: CHANNELS.EMAIL,
    subject: 'I was charged twice for my order #8841',
    description: 'I was reviewing my credit card statement today and noticed two identical charges of $149.00 on September 2nd for order #8841. Please refund the extra charge immediately.',
    category: CATEGORIES.PAYMENT,
    priority: PRIORITIES.MEDIUM, // Medium Priority -> Weight = 2
    confidence: 0.95,
    classificationReason: 'Customer reports receiving two charges ($149.00) for single order #8841 requiring duplicate payment verification and refund.',
    status: STATUSES.ASSIGNED,
    teamId: teamMap['BILLING'],
    assignedAgentId: billingAgent1._id, // Alex Rivera (Workload Score = 2)
    slaDeadline: new Date(Date.now() + 420 * 60 * 1000), // Medium SLA (8 hours)
    slaStatus: SLA_STATUSES.ON_TRACK,
    retrievedKnowledge: [
      { docId: knowledgeDocs[0]._id, title: knowledgeDocs[0].title, score: 0.94, excerpt: knowledgeDocs[0].summary },
      { docId: knowledgeDocs[1]._id, title: knowledgeDocs[1].title, score: 0.88, excerpt: knowledgeDocs[1].summary }
    ],
    aiRecommendation: [
      { step: 1, action: 'Verify Merchant Billing Gateway', detail: 'Inspect payment portal for order #8841 and locate duplicate transaction IDs (TXN-9941 & TXN-9942).' },
      { step: 2, action: 'Confirm Settlement Status', detail: 'Check if second transaction is a posted settlement or pending auth hold.' },
      { step: 3, action: 'Issue Direct Refund', detail: 'Process immediate $149.00 credit back to customer card according to Duplicate Payment Policy.' },
      { step: 4, action: 'Approve Customer Communication', detail: 'Dispatch approved response to customer via Email channel confirming refund submission.' }
    ],
    draftResponse: `Dear Robert Vance,\n\nThank you for bringing this duplicate payment matter to our attention regarding order #8841.\n\nWe have reviewed your billing statement and located the duplicate transaction of $149.00. Our billing team is currently processing the refund back to your original payment method in accordance with our Duplicate Payment Policy.\n\nYou will receive a confirmation receipt once the financial institution posts the credit (typically within 2-3 business days).\n\nBest regards,\nAlex Rivera\nBilling Customer Support`,
    isDraftApproved: false,
  });

  // Audit Logs for Alex's Ticket (TICK-1024)
  await AuditLog.insertMany([
    {
      ticketId: primaryTicket._id,
      ticketCode: primaryTicket.ticketId,
      event: 'TICKET_CREATED',
      actor: { name: 'Robert Vance (Customer)', role: 'CUSTOMER' },
      details: 'Submitted ticket via Email channel regarding duplicate charge on order #8841',
      timestamp: new Date(Date.now() - 6 * 60 * 1000),
    },
    {
      ticketId: primaryTicket._id,
      ticketCode: primaryTicket.ticketId,
      event: 'AI_CLASSIFIED',
      actor: { name: 'SYSTEM_AI', role: 'SYSTEM' },
      details: 'AI Classified ticket as Category: Payment, Priority: Medium (95% confidence, Weight: 2)',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      ticketId: primaryTicket._id,
      ticketCode: primaryTicket.ticketId,
      event: 'ROUTED_TO_TEAM',
      actor: { name: 'SYSTEM_ROUTER', role: 'SYSTEM' },
      details: 'Backend rules engine routed ticket to Billing Team based on Category: Payment',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
    },
    {
      ticketId: primaryTicket._id,
      ticketCode: primaryTicket.ticketId,
      event: 'AGENT_ASSIGNED',
      actor: { name: 'ASSIGNMENT_ENGINE', role: 'SYSTEM' },
      details: 'Workload Engine selected Alex Rivera (Workload Score: 0) over Marcus Vance (Workload Score: 8)',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
    {
      ticketId: primaryTicket._id,
      ticketCode: primaryTicket.ticketId,
      event: 'RAG_KNOWLEDGE_RETRIEVED',
      actor: { name: 'RAG_ENGINE', role: 'SYSTEM' },
      details: 'Retrieved Duplicate Payment Policy (94% match) and Refund Policy (88% match)',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
  ]);

  // 7. Marcus Vance Ticket: TICK-1001 (Critical Priority -> Weight = 8)
  const marcusTicket = await Ticket.create({
    ticketId: 'TICK-1001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 998-1122',
    },
    channel: CHANNELS.EMAIL,
    subject: 'Urgent payment gateway authorization failure & dispute',
    description: 'Merchant payment gateway is holding $4,500 on customer account after unexpected auth failure. Customer demands immediate emergency release.',
    category: CATEGORIES.PAYMENT,
    priority: PRIORITIES.CRITICAL, // Critical Priority -> Weight = 8
    confidence: 0.98,
    classificationReason: 'High monetary impact payment gateway authorization hold requiring immediate senior billing intervention.',
    status: STATUSES.IN_PROGRESS,
    teamId: teamMap['BILLING'],
    assignedAgentId: billingAgent2._id, // Marcus Vance (Workload Score = 8)
    slaDeadline: new Date(Date.now() + 25 * 60 * 1000), // Critical SLA (30 mins)
    slaStatus: SLA_STATUSES.ON_TRACK,
    retrievedKnowledge: [
      { docId: knowledgeDocs[0]._id, title: knowledgeDocs[0].title, score: 0.96, excerpt: knowledgeDocs[0].summary },
      { docId: knowledgeDocs[1]._id, title: knowledgeDocs[1].title, score: 0.91, excerpt: knowledgeDocs[1].summary }
    ],
    aiRecommendation: [
      { step: 1, action: 'Access Payment Gateway Manager', detail: 'Inspect payment authorization transaction #AUTH-9902 in merchant portal.' },
      { step: 2, action: 'Release Pending Authorization Hold', detail: 'Submit manual void signal to issuing bank to clear $4,500 authorization hold.' },
      { step: 3, action: 'Notify Customer & Escalation Lead', detail: 'Dispatch confirmation email to John Doe confirming release of funds.' }
    ],
    draftResponse: `Dear John Doe,\n\nWe have urgent status update regarding the $4,500 authorization hold on transaction #AUTH-9902.\n\nOur senior billing manager Marcus Vance has manually issued a void signal to your card issuer to clear the authorization hold immediately.\n\nBest regards,\nMarcus Vance\nSenior Billing Support`,
    isDraftApproved: false,
  });

  // Audit Logs for Marcus's Ticket (TICK-1001)
  await AuditLog.insertMany([
    {
      ticketId: marcusTicket._id,
      ticketCode: marcusTicket.ticketId,
      event: 'TICKET_CREATED',
      actor: { name: 'John Doe (Customer)', role: 'CUSTOMER' },
      details: 'Submitted urgent ticket via Email regarding payment gateway authorization hold',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      ticketId: marcusTicket._id,
      ticketCode: marcusTicket.ticketId,
      event: 'AI_CLASSIFIED',
      actor: { name: 'SYSTEM_AI', role: 'SYSTEM' },
      details: 'AI Classified ticket as Category: Payment, Priority: Critical (98% confidence, Weight: 8)',
      timestamp: new Date(Date.now() - 19 * 60 * 1000),
    },
    {
      ticketId: marcusTicket._id,
      ticketCode: marcusTicket.ticketId,
      event: 'ROUTED_TO_TEAM',
      actor: { name: 'SYSTEM_ROUTER', role: 'SYSTEM' },
      details: 'Backend rules engine routed ticket to Billing Team based on Category: Payment',
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
    },
    {
      ticketId: marcusTicket._id,
      ticketCode: marcusTicket.ticketId,
      event: 'AGENT_ASSIGNED',
      actor: { name: 'ASSIGNMENT_ENGINE', role: 'SYSTEM' },
      details: 'Assigned to Senior Billing Agent Marcus Vance',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      ticketId: marcusTicket._id,
      ticketCode: marcusTicket.ticketId,
      event: 'RAG_KNOWLEDGE_RETRIEVED',
      actor: { name: 'RAG_ENGINE', role: 'SYSTEM' },
      details: 'Retrieved Duplicate Payment SOP (96% match) and Refund Policy (91% match)',
      timestamp: new Date(Date.now() - 14 * 60 * 1000),
    },
  ]);

  // Secondary tickets for Tech and Logistics
  await Ticket.create({
    ticketId: 'TICK-1025',
    customer: { name: 'TechCorp Ops', email: 'dev@techcorp.io' },
    channel: CHANNELS.WEB_FORM,
    subject: 'Production API returning 500 Internal Server Error',
    description: 'Our integration endpoint started returning 500 errors starting 10 minutes ago.',
    category: CATEGORIES.TECHNICAL,
    priority: PRIORITIES.CRITICAL,
    confidence: 0.98,
    status: STATUSES.IN_PROGRESS,
    teamId: teamMap['TECH'],
    assignedAgentId: techAgent._id,
    slaDeadline: new Date(Date.now() + 15 * 60 * 1000),
    slaStatus: SLA_STATUSES.AT_RISK,
  });

  await Ticket.create({
    ticketId: 'TICK-1026',
    customer: { name: 'Sarah Jenkins', email: 'sarah.j@gmail.com' },
    channel: CHANNELS.WHATSAPP,
    subject: 'Package tracking status stuck in transit',
    description: 'My order #9921 was supposed to arrive yesterday but tracking shows stuck in warehouse.',
    category: CATEGORIES.DELIVERY,
    priority: PRIORITIES.MEDIUM,
    confidence: 0.89,
    status: STATUSES.RESOLVED,
    teamId: teamMap['LOGISTICS'],
    assignedAgentId: logisticsAgent._id,
    resolvedAt: new Date(),
    slaDeadline: new Date(Date.now() + 300 * 60 * 1000),
    slaStatus: SLA_STATUSES.ON_TRACK,
  });

  console.log('[Seed] Database successfully seeded with department dataset & complete audit/recommendation groundings!');

  if (!skipDisconnect) {
    await disconnectDB();
    process.exit(0);
  }
};

if (require.main === module) {
  seedData(false).catch(err => {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  });
}

module.exports = { seedData };
