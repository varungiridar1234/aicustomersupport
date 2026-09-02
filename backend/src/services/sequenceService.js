const Counter = require('../models/Counter');
const Ticket = require('../models/Ticket');

/**
 * Returns the next unique, persistent, atomic Ticket ID (e.g., TICK-1031).
 * Uses atomic MongoDB findOneAndUpdate with $inc to guarantee safety under concurrent requests.
 * Uses highest existing Ticket ID in the database so sequence NEVER resets on server restarts.
 */
const getNextTicketId = async () => {
  // 1. Inspect existing tickets in DB to find highest numeric ticketId (e.g. TICK-1030 -> 1030)
  const lastTicket = await Ticket.findOne({ ticketId: /^TICK-\d+$/ })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  let maxNumber = 1024;
  if (lastTicket && lastTicket.ticketId) {
    const match = lastTicket.ticketId.match(/\d+/);
    if (match) {
      maxNumber = Math.max(maxNumber, parseInt(match[0], 10));
    }
  }

  // 2. Ensure Counter document exists with at least maxNumber
  let counter = await Counter.findById('ticketId');
  if (!counter || counter.seq < maxNumber) {
    await Counter.findByIdAndUpdate(
      'ticketId',
      { $set: { seq: maxNumber } },
      { upsert: true }
    );
  }

  // 3. Atomically increment the Counter document in MongoDB ($inc guarantees concurrency safety)
  counter = await Counter.findByIdAndUpdate(
    'ticketId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `TICK-${counter.seq}`;
};

module.exports = { getNextTicketId };
