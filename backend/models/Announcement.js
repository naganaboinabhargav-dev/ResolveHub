const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ['all', 'clients', 'agents', 'admins'], default: 'all' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    pinned: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
