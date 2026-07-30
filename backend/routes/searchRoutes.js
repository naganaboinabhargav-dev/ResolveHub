const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/searchController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), globalSearch);

module.exports = router;
