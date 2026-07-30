const mongoose = require('mongoose');

// Reusable reply templates for agents/admins to insert into ticket replies.
const savedResponseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    scope: { type: String, enum: ['personal', 'global'], default: 'personal' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedResponse', savedResponseSchema);
