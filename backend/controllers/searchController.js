const asyncHandler = require('../utils/asyncHandler');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Resource = require('../models/Resource');

// @desc    Universal search across tickets, users, and resources (admin only)
// @route   GET /api/search?q=...
// @access  Private/Admin
const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({ success: true, tickets: [], users: [], resources: [] });
  }
  const regex = { $regex: q, $options: 'i' };

  const [tickets, users, resources] = await Promise.all([
    Ticket.find({ $or: [{ subject: regex }, { ticketNumber: regex }] })
      .select('ticketNumber subject status priority')
      .limit(6),
    User.find({ role: { $ne: 'admin' }, $or: [{ name: regex }, { email: regex }] })
      .select('name email role')
      .limit(6),
    Resource.find({ name: regex }).populate('client', 'name').select('name type client').limit(6),
  ]);

  res.json({ success: true, tickets, users, resources });
});

module.exports = { globalSearch };
