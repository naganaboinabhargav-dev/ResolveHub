const asyncHandler = require('../utils/asyncHandler');
const AuditLog = require('../models/AuditLog');

// @desc    List recent audit log entries
// @route   GET /api/audit
// @access  Private/Admin
const getAuditLog = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);

  res.json({ success: true, logs, total, page, pages: Math.ceil(total / limit) });
});

module.exports = { getAuditLog };
