const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies JWT and attaches the authenticated user to the request
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }
    if (!user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated. Contact your administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

// Restricts a route to the given roles, e.g. authorize('admin', 'agent')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user ? req.user.role : 'guest'}' is not permitted to access this resource`);
  }
  next();
};

module.exports = { protect, authorize };
