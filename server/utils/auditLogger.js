const AuditLog = require('../models/AuditLog');

exports.createAuditLog = async ({ userId, action, entity, entityId, details, ipAddress, oldValue, newValue }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      details,
      ipAddress,
      oldValue,
      newValue
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main flow
  }
};