const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const notify = require('../utils/notify');

// @desc    Register a new client account (public sign-up)
// @route   POST /api/auth/register
// @access  Public
const registerClient = asyncHandler(async (req, res) => {
  const { name, email, password, company, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
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
    company,
    phone,
    role: 'client',
    plan: 'basic',
  });

  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify({
        user: admin._id,
        title: 'New client registered',
        message: `${user.name} created a client account.`,
        type: 'user_created',
      })
    )
  );

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc    Login for admin, agent, and client
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact your administrator.');
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update own profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, company } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (company !== undefined) user.company = company;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Change own password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { registerClient, login, getMe, updateProfile, changePassword };
