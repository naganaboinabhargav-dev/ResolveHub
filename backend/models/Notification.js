const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'ticket_created',
        'ticket_assigned',
        'ticket_replied',
        'ticket_status',
        'ticket_escalated',
        'ticket_closed',
        'user_created',
        'general',
      ],
      default: 'general',
    },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
