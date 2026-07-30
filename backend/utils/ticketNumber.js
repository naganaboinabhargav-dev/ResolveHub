const Ticket = require('../models/Ticket');

// Generates sequential, human-friendly ticket numbers like TKT-2026-0001
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Ticket.countDocuments({
    ticketNumber: { $regex: `^TKT-${year}-` },
  });
  const next = String(count + 1).padStart(4, '0');
  return `TKT-${year}-${next}`;
};

module.exports = generateTicketNumber;
