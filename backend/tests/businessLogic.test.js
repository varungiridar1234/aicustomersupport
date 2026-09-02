const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Ticket = require('../src/models/Ticket');
const AuditLog = require('../src/models/AuditLog');
const RoutingRule = require('../src/models/RoutingRule');
const StateMachine = require('../src/services/stateMachine');
const RoutingService = require('../src/services/routingService');
const AssignmentService = require('../src/services/assignmentService');
const SLAService = require('../src/services/slaService');
const { ROLES, PRIORITIES, CATEGORIES, STATUSES } = require('../src/config/constants');
const { generateToken } = require('../src/middleware/auth');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Ticket.deleteMany({}),
    AuditLog.deleteMany({}),
    RoutingRule.deleteMany({}),
  ]);
});

describe('1. Health Check Endpoint', () => {
  it('GET /health returns 200 OK with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('2. Deterministic Routing Engine Tests', () => {
  it('Payment category routes to Billing team', async () => {
    const billingTeam = await Team.create({ name: 'Billing', code: 'BILLING' });
    await RoutingRule.create({ name: 'Payment Rule', category: CATEGORIES.PAYMENT, teamId: billingTeam._id });

    const teamId = await RoutingService.resolveTeam(CATEGORIES.PAYMENT, PRIORITIES.HIGH);
    expect(teamId.toString()).toBe(billingTeam._id.toString());
  });

  it('Technical category routes to Technical Support team', async () => {
    const techTeam = await Team.create({ name: 'Technical Support', code: 'TECH' });
    await RoutingRule.create({ name: 'Tech Rule', category: CATEGORIES.TECHNICAL, teamId: techTeam._id });

    const teamId = await RoutingService.resolveTeam(CATEGORIES.TECHNICAL, PRIORITIES.CRITICAL);
    expect(teamId.toString()).toBe(techTeam._id.toString());
  });
});

describe('3. SLA Calculation Tests', () => {
  it('Critical priority receives 30 minute SLA deadline', async () => {
    const createdTime = new Date('2026-09-02T10:00:00Z');
    const deadline = await SLAService.calculateDeadline(PRIORITIES.CRITICAL, createdTime);
    expect(deadline.toISOString()).toBe('2026-09-02T10:30:00.000Z');
  });

  it('High priority receives 120 minute (2 hour) SLA deadline', async () => {
    const createdTime = new Date('2026-09-02T10:00:00Z');
    const deadline = await SLAService.calculateDeadline(PRIORITIES.HIGH, createdTime);
    expect(deadline.toISOString()).toBe('2026-09-02T12:00:00.000Z');
  });
});

describe('4. Workload & Automatic Assignment Tests', () => {
  it('Calculates workload score accurately: Low=1, Med=2, High=4, Critical=8', async () => {
    const team = await Team.create({ name: 'Billing', code: 'BILLING' });
    const agent = await User.create({ name: 'Agent Smith', email: 'smith@test.com', password: 'pass', role: ROLES.AGENT, teamId: team._id });

    await Ticket.create({ ticketId: 'T-1', subject: 'T1', description: 'D', customer: { name: 'C', email: 'e@t.com' }, channel: 'Email', status: STATUSES.IN_PROGRESS, priority: PRIORITIES.CRITICAL, assignedAgentId: agent._id }); // 8
    await Ticket.create({ ticketId: 'T-2', subject: 'T2', description: 'D', customer: { name: 'C', email: 'e@t.com' }, channel: 'Email', status: STATUSES.ASSIGNED, priority: PRIORITIES.MEDIUM, assignedAgentId: agent._id }); // 2

    const { workloadScore } = await AssignmentService.calculateAgentWorkload(agent._id);
    expect(workloadScore).toBe(10); // 8 + 2 = 10
  });

  it('Assigns ticket to available agent with lowest workload score', async () => {
    const team = await Team.create({ name: 'Billing', code: 'BILLING' });
    
    // Agent A (Busy: 1 Critical ticket = score 8)
    const agentA = await User.create({ name: 'Agent A', email: 'a@test.com', password: 'pass', role: ROLES.AGENT, teamId: team._id, isAvailable: true });
    await Ticket.create({ ticketId: 'T-A', subject: 'T', description: 'D', customer: { name: 'C', email: 'e@t.com' }, channel: 'Email', status: STATUSES.IN_PROGRESS, priority: PRIORITIES.CRITICAL, assignedAgentId: agentA._id });

    // Agent B (Free: score 0)
    const agentB = await User.create({ name: 'Agent B', email: 'b@test.com', password: 'pass', role: ROLES.AGENT, teamId: team._id, isAvailable: true });

    const newTicket = { ticketId: 'T-NEW', subject: 'New Charge Issue' };
    const assignedAgentId = await AssignmentService.assignTicketToAgent(newTicket, team._id);

    expect(assignedAgentId.toString()).toBe(agentB._id.toString());
  });
});

describe('5. State Machine Invariants', () => {
  it('Validates legal state transitions', () => {
    expect(StateMachine.isValidTransition('NEW', 'UNCLASSIFIED')).toBe(true);
    expect(StateMachine.isValidTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(StateMachine.isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
  });

  it('Rejects illegal state transitions (NEW -> CLOSED)', () => {
    expect(StateMachine.isValidTransition('NEW', 'CLOSED')).toBe(false);
    expect(() => StateMachine.validateTransition('NEW', 'CLOSED')).toThrow(/Invalid state transition/);
  });
});

describe('6. External Customer Portal Ingestion Endpoint (POST /api/tickets/external)', () => {
  it('Processes external customer request, runs AI+Routing+Assignment pipeline, and returns customer-safe response', async () => {
    // Seed Billing Team & Agent
    const billingTeam = await Team.create({ name: 'Billing', code: 'BILLING' });
    await RoutingRule.create({ name: 'Payment Rule', category: CATEGORIES.PAYMENT, teamId: billingTeam._id });
    const agent = await User.create({ name: 'Alex Rivera', email: 'alex@support.com', password: 'pass', role: ROLES.AGENT, teamId: billingTeam._id, isAvailable: true });

    const res = await request(app)
      .post('/api/tickets/external')
      .send({
        customer: {
          name: 'Rahul',
          email: 'rahul@example.com'
        },
        subject: 'Duplicate payment',
        message: 'I was charged twice for my order.',
        channel: 'customer_portal',
        source: 'external_customer_portal'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.ticketId).toBeDefined();
    expect(res.body.status).toBe('RECEIVED');
    expect(res.body.message).toBe('Your support request has been received.');
    expect(res.body.internalPrompt).toBeUndefined();
    expect(res.body.apiKey).toBeUndefined();

    // Verify stored ticket details in database
    const savedTicket = await Ticket.findOne({ ticketId: res.body.ticketId });
    expect(savedTicket).toBeDefined();
    expect(savedTicket.customer.name).toBe('Rahul');
    expect(savedTicket.customer.email).toBe('rahul@example.com');
    expect(savedTicket.subject).toBe('Duplicate payment');
    expect(savedTicket.description).toBe('I was charged twice for my order.');
    expect(savedTicket.category).toBe(CATEGORIES.PAYMENT);
    expect(savedTicket.priority).toBe(PRIORITIES.HIGH);
    expect(savedTicket.teamId.toString()).toBe(billingTeam._id.toString());
    expect(savedTicket.assignedAgentId.toString()).toBe(agent._id.toString());
    expect(savedTicket.source).toBe('external_customer_portal');

    // Verify audit logs generated
    const auditLogs = await AuditLog.find({ ticketId: savedTicket._id });
    const createdEvent = auditLogs.find(l => l.event === 'TICKET_CREATED_FROM_CUSTOMER_PORTAL');
    expect(createdEvent).toBeDefined();
  });
});
