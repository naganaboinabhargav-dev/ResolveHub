const asyncHandler = require('../utils/asyncHandler');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Resource = require('../models/Resource');

// @desc    Dashboard analytics, scoped by role
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.user.role === 'client') baseFilter.client = req.user._id;
  if (req.user.role === 'agent') baseFilter.assignedAgent = req.user._id;

  const [statusAgg, priorityAgg, categoryAgg, monthlyAgg, totals] = await Promise.all([
    Ticket.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Ticket.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Ticket.aggregate([
      { $match: baseFilter },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Ticket.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          created: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Ticket.countDocuments(baseFilter),
  ]);

  const openCount = await Ticket.countDocuments({ ...baseFilter, status: { $in: ['Open', 'Assigned', 'In Progress', 'Pending'] } });
  const resolvedCount = await Ticket.countDocuments({ ...baseFilter, status: { $in: ['Resolved', 'Closed'] } });
  const criticalCount = await Ticket.countDocuments({ ...baseFilter, priority: 'Critical', status: { $nin: ['Resolved', 'Closed'] } });
  const escalatedCount = await Ticket.countDocuments({ ...baseFilter, isEscalated: true, status: { $nin: ['Resolved', 'Closed'] } });

  // Customer satisfaction (CSAT) — average of all submitted star ratings
  const [csatAgg] = await Ticket.aggregate([
    { $match: { ...baseFilter, 'rating.stars': { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$rating.stars' }, count: { $sum: 1 } } },
  ]);
  const csat = csatAgg ? { average: Math.round(csatAgg.avg * 10) / 10, count: csatAgg.count } : { average: null, count: 0 };

  let extra = {};
  if (req.user.role === 'admin') {
    const [totalClients, totalAgents, totalResources, unassigned] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'agent' }),
      Resource.countDocuments(),
      Ticket.countDocuments({ assignedAgent: null, status: { $nin: ['Resolved', 'Closed'] } }),
    ]);
    extra = { totalClients, totalAgents, totalResources, unassigned };

    // Agent leaderboard: resolved count + average rating per agent
    const leaderboard = await Ticket.aggregate([
      { $match: { assignedAgent: { $ne: null } } },
      {
        $group: {
          _id: '$assignedAgent',
          resolvedCount: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
          totalAssigned: { $sum: 1 },
          avgRating: { $avg: '$rating.stars' },
          ratingCount: { $sum: { $cond: [{ $ifNull: ['$rating.stars', false] }, 1, 0] } },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: '$agent' },
      {
        $project: {
          name: '$agent.name',
          resolvedCount: 1,
          totalAssigned: 1,
          avgRating: { $round: [{ $ifNull: ['$avgRating', 0] }, 1] },
          ratingCount: 1,
        },
      },
      { $sort: { resolvedCount: -1 } },
    ]);
    extra.agentLeaderboard = leaderboard;
  }

  if (req.user.role === 'agent') {
    const [myCsatAgg] = await Ticket.aggregate([
      { $match: { assignedAgent: req.user._id, 'rating.stars': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating.stars' }, count: { $sum: 1 } } },
    ]);
    extra.myRating = myCsatAgg ? { average: Math.round(myCsatAgg.avg * 10) / 10, count: myCsatAgg.count } : { average: null, count: 0 };
  }

  res.json({
    success: true,
    totals: { all: totals, open: openCount, resolved: resolvedCount, critical: criticalCount, escalated: escalatedCount, ...extra },
    csat,
    byStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
    byPriority: priorityAgg.map((p) => ({ priority: p._id, count: p.count })),
    byCategory: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
    monthlyTrend: monthlyAgg.map((m) => ({
      label: `${m._id.month}/${m._id.year}`,
      created: m.created,
      resolved: m.resolved,
    })),
  });
});

module.exports = { getDashboardStats };
