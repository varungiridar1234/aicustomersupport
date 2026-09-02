const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Ticket = require('../src/models/Ticket');
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
    RoutingRule.deleteMany({}),
  ]);
});

describe('1. Deterministic Routing Engine Tests', () => {
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

describe('2. SLA Calculation Tests', () => {
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

describe('3. Workload & Automatic Assignment Tests', () => {
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

describe('4. State Machine Invariants', () => {
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

describe('5. Authentication & Authorization Protection', () => {
  it('Rejects unauthorized requests to admin endpoints', async () => {
    const agentUser = await User.create({ name: 'Agent', email: 'agent@test.com', password: 'pass', role: ROLES.AGENT });
    const token = generateToken(agentUser._id);

    const res = await request(app)
      .get('/api/admin/teams')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('6. Ticket Creation Endpoint Test', () => {
  it('Creates ticket and triggers AI classification and routing pipeline', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        customerName: 'Alice Miller',
        customerEmail: 'alice@example.com',
        channel: 'Email',
        subject: 'Charged twice for my order #8841',
        description: 'I noticed two payments of $149 on my credit card statement.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.ticket).toBeDefined();
    expect(res.body.ticket.category).toBe(CATEGORIES.PAYMENT);
    expect(res.body.ticket.priority).toBe(PRIORITIES.HIGH);
  });
});
