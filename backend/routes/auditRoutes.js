const express = require('express');
const router = express.Router();
const { getAuditLog } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAuditLog);

module.exports = router;
