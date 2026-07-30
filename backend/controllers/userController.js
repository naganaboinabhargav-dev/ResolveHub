const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const notify = require('../utils/notify');
const audit = require('../utils/audit');

// @desc    Get all users (optionally filtered by role)
// @route   GET /api/users?role=client
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Create a client or agent account (admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, company, plan } = req.body;

  if (!['agent', 'client'].includes(role)) {
    res.status(400);
    throw new Error('Admins can only create agent or client accounts');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    company,
    plan: plan || 'basic',
  });

  await audit({ actor: req.user, action: 'Created user', entityType: 'User', entityId: user._id, detail: `${user.name} (${user.role})` });

  res.status(201).json({ success: true, user });
});

// @desc    Update a user's details or plan (role cannot be changed to admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, company, plan, role } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (company !== undefined) user.company = company;
  if (plan) user.plan = plan;
  if (role) {
    if (role === 'admin' || user.role === 'admin') {
      res.status(403);
      throw new Error('Admin accounts cannot be created or reassigned from this panel');
    }
    user.role = role;
  }

  await user.save();
  res.json({ success: true, user });
});

// @desc    Activate / deactivate a user
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deactivated from this panel');
  }
  user.isActive = !user.isActive;
  await user.save();
  await audit({ actor: req.user, action: user.isActive ? 'Activated user' : 'Deactivated user', entityType: 'User', entityId: user._id, detail: user.name });
  res.json({ success: true, user });
});

// @desc    Delete a client or agent account
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deleted from this panel');
  }
  await user.deleteOne();
  await audit({ actor: req.user, action: 'Deleted user', entityType: 'User', entityId: user._id, detail: `${user.name} (${user.role})` });
  res.json({ success: true, message: 'User removed' });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};
