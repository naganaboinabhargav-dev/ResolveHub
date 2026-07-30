const mongoose = require('mongoose');

// Direct messaging between Admin Team and a single agent/client.
// `user` is always the non-admin party and acts as the conversation key,
// since any admin can pick up and continue a conversation with that user.
const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'agent', 'client'], required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
