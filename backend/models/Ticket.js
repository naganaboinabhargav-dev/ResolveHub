const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'agent', 'client'] },
    text: { type: String, required: true },
    attachments: [{ type: String }],
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const historySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    detail: { type: String, default: '' },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    resourceType: { type: String, enum: ['product', 'service', 'project'], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, required: true },
    dynamicData: { type: mongoose.Schema.Types.Mixed, default: {} },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'],
      default: 'Open',
    },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    messages: [messageSchema],
    history: [historySchema],
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    reopenCount: { type: Number, default: 0 },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true }
);

ticketSchema.index({ subject: 'text', ticketNumber: 'text' });

module.exports = mongoose.model('Ticket', ticketSchema);
