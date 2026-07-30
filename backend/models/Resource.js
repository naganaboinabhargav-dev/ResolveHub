const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['product', 'service', 'project'],
      required: true,
    },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
    meta: {
      serialNumber: { type: String },
      warrantyUntil: { type: Date },
      subscriptionId: { type: String },
      moduleList: [{ type: String }],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
