const express = require('express');
const router = express.Router();
const { getSavedResponses, createSavedResponse, deleteSavedResponse } = require('../controllers/savedResponseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'agent'));

router.route('/').get(getSavedResponses).post(createSavedResponse);
router.delete('/:id', deleteSavedResponse);

module.exports = router;
