const asyncHandler = require('../utils/asyncHandler');
const Resource = require('../models/Resource');
const notify = require('../utils/notify');

// @desc    Get resources (admin sees all/filterable, client sees own)
// @route   GET /api/resources
// @access  Private
const getResources = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'client') {
    filter.client = req.user._id;
  } else if (req.query.client) {
    filter.client = req.query.client;
  }
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;

  const resources = await Resource.find(filter)
    .populate('client', 'name email company')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: resources.length, resources });
});

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id).populate('client', 'name email company');
  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }
  if (req.user.role === 'client' && String(resource.client._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this resource');
  }
  res.json({ success: true, resource });
});

// @desc    Create & assign a resource to a client
// @route   POST /api/resources
// @access  Private/Admin
const createResource = asyncHandler(async (req, res) => {
  const { name, type, client, description, meta } = req.body;

  const resource = await Resource.create({
    name,
    type,
    client,
    description,
    meta,
    createdBy: req.user._id,
  });

  await notify({
    user: client,
    title: 'New resource assigned',
    message: `${resource.name} has been assigned to your account.`,
    type: 'general',
  });

  res.status(201).json({ success: true, resource });
});

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  const { name, description, status, meta } = req.body;
  if (name) resource.name = name;
  if (description !== undefined) resource.description = description;
  if (status) resource.status = status;
  if (meta) resource.meta = { ...resource.meta, ...meta };

  await resource.save();
  res.json({ success: true, resource });
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }
  await resource.deleteOne();
  res.json({ success: true, message: 'Resource removed' });
});

module.exports = { getResources, getResource, createResource, updateResource, deleteResource };
