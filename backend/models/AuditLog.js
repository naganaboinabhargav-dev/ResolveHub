const mongoose = require('mongoose');

// Records significant admin actions for accountability and troubleshooting.
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "Deleted user", "Reassigned ticket"
    entityType: { type: String, required: true }, // "User", "Ticket", "Resource", "Category", "Announcement"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    detail: { type: String, default: '' },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
