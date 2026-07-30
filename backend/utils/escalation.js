const Ticket = require('../models/Ticket');
const User = require('../models/User');
const notify = require('./notify');

// SLA thresholds (ms) before an unattended ticket is flagged as escalated.
const SLA_MS = {
  Critical: 1 * 60 * 60 * 1000, // 1 hour
  High: 4 * 60 * 60 * 1000, // 4 hours
  Medium: 24 * 60 * 60 * 1000, // 1 business day
  Low: 72 * 60 * 60 * 1000, // 3 days
};

// Flags tickets that have sat in Open/Assigned too long for their priority,
// and pings admins the moment a ticket first breaches its SLA.
const checkEscalations = async () => {
  try {
    const candidates = await Ticket.find({
      status: { $in: ['Open', 'Assigned'] },
      isEscalated: false,
    }).select('ticketNumber subject priority createdAt status');

    const now = Date.now();
    const admins = await User.find({ role: 'admin' }).select('_id');

    for (const ticket of candidates) {
      const threshold = SLA_MS[ticket.priority] || SLA_MS.Medium;
      const age = now - new Date(ticket.createdAt).getTime();
      if (age > threshold) {
        await Ticket.updateOne(
          { _id: ticket._id },
          {
            $set: { isEscalated: true, escalatedAt: new Date() },
            $push: { history: { action: 'Escalated — SLA breached', by: null } },
          }
        );
        await Promise.all(
          admins.map((admin) =>
            notify({
              user: admin._id,
              title: 'SLA breached — ticket escalated',
              message: `${ticket.ticketNumber} (${ticket.priority}) has been unattended past its SLA window.`,
              type: 'ticket_escalated',
              ticket: ticket._id,
            })
          )
        );
      }
    }
  } catch (error) {
    console.error('Escalation check failed:', error.message);
  }
};

module.exports = { checkEscalations, SLA_MS };
