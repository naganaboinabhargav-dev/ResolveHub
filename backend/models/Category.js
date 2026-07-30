const mongoose = require('mongoose');

const dynamicFieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'date', 'number'],
      default: 'text',
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: '❓' },
    description: { type: String, default: '' },
    subcategories: [{ type: String }],
    dynamicFields: [dynamicFieldSchema],
    applicableResourceTypes: [
      { type: String, enum: ['product', 'service', 'project'] },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
