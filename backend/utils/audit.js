const AuditLog = require('../models/AuditLog');

// Fire-and-forget audit trail helper, mirroring the notify() pattern.
const audit = async ({ actor, action, entityType, entityId, detail = '' }) => {
  try {
    await AuditLog.create({
      actor: actor._id,
      actorName: actor.name,
      action,
      entityType,
      entityId,
      detail,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = audit;
