const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getResources).post(authorize('admin'), createResource);
router
  .route('/:id')
  .get(getResource)
  .put(authorize('admin'), updateResource)
  .delete(authorize('admin'), deleteResource);

module.exports = router;
