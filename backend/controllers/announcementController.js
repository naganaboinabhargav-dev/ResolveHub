const asyncHandler = require('../utils/asyncHandler');
const Announcement = require('../models/Announcement');
const audit = require('../utils/audit');

const audienceForRole = (role) => (role === 'admin' ? 'admins' : role === 'agent' ? 'agents' : 'clients');

// @desc    Get currently-active announcements targeted at the logged-in user's role
// @route   GET /api/announcements
// @access  Private
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const now = new Date();
  const announcements = await Announcement.find({
    audience: { $in: ['all', audienceForRole(req.user.role)] },
    startDate: { $lte: now },
    $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
  }).sort({ pinned: -1, createdAt: -1 });
  res.json({ success: true, announcements });
});

// @desc    Admin: list every announcement (including past/future) for management
// @route   GET /api/announcements/all
// @access  Private/Admin
const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json({ success: true, announcements });
});

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience, priority, startDate, endDate, pinned } = req.body;
  const announcement = await Announcement.create({
    title, message, audience, priority, startDate, endDate, pinned, createdBy: req.user._id,
  });
  await audit({ actor: req.user, action: 'Created announcement', entityType: 'Announcement', entityId: announcement._id, detail: title });
  res.status(201).json({ success: true, announcement });
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  Object.assign(announcement, req.body);
  await announcement.save();
  await audit({ actor: req.user, action: 'Updated announcement', entityType: 'Announcement', entityId: announcement._id, detail: announcement.title });
  res.json({ success: true, announcement });
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  await announcement.deleteOne();
  await audit({ actor: req.user, action: 'Deleted announcement', entityType: 'Announcement', entityId: announcement._id, detail: announcement.title });
  res.json({ success: true, message: 'Announcement removed' });
});

module.exports = { getActiveAnnouncements, getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
