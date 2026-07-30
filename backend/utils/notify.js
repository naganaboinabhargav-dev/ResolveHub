const Notification = require('../models/Notification');

// Creates a notification for a single user. Fire-and-forget style helper
// used across controllers so notification logic stays in one place.
const notify = async ({ user, title, message, type = 'general', ticket = null }) => {
  try {
    await Notification.create({ user, title, message, type, ticket });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = notify;
