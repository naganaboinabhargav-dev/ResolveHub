const asyncHandler = require('../utils/asyncHandler');
const SavedResponse = require('../models/SavedResponse');

// @desc    List saved responses visible to the current staff member
//          (their own personal ones + all global ones)
// @route   GET /api/saved-responses
// @access  Private/Admin/Agent
const getSavedResponses = asyncHandler(async (req, res) => {
  const responses = await SavedResponse.find({
    $or: [{ scope: 'global' }, { createdBy: req.user._id }],
  }).sort({ createdAt: -1 });
  res.json({ success: true, responses });
});

// @desc    Create a saved response. Only admins can create global ones.
// @route   POST /api/saved-responses
// @access  Private/Admin/Agent
const createSavedResponse = asyncHandler(async (req, res) => {
  const { title, body, scope } = req.body;
  const finalScope = req.user.role === 'admin' && scope === 'global' ? 'global' : 'personal';

  const response = await SavedResponse.create({
    title,
    body,
    scope: finalScope,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, response });
});

// @desc    Delete a saved response you created
// @route   DELETE /api/saved-responses/:id
// @access  Private/Admin/Agent
const deleteSavedResponse = asyncHandler(async (req, res) => {
  const response = await SavedResponse.findById(req.params.id);
  if (!response) {
    res.status(404);
    throw new Error('Saved response not found');
  }
  if (String(response.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own saved responses');
  }
  await response.deleteOne();
  res.json({ success: true, message: 'Saved response removed' });
});

module.exports = { getSavedResponses, createSavedResponse, deleteSavedResponse };
