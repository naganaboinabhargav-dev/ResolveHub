const asyncHandler = require('../utils/asyncHandler');
const Ticket = require('../models/Ticket');
const Resource = require('../models/Resource');
const User = require('../models/User');
const generateTicketNumber = require('../utils/ticketNumber');
const notify = require('../utils/notify');
const audit = require('../utils/audit');

const populateOpts = [
  { path: 'client', select: 'name email company plan' },
  { path: 'resource', select: 'name type' },
  { path: 'category', select: 'name icon' },
  { path: 'assignedAgent', select: 'name email' },
  { path: 'messages.sender', select: 'name role' },
  { path: 'history.by', select: 'name role' },
];

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private/Client
const createTicket = asyncHandler(async (req, res) => {
  const { subject, resource, category, subcategory, dynamicData, description, priority, attachments } = req.body;

  const resourceDoc = await Resource.findById(resource);
  if (!resourceDoc) {
    res.status(404);
    throw new Error('Selected resource was not found');
  }
  if (String(resourceDoc.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only raise tickets for your own resources');
  }

  const warrantyUntil = resourceDoc.meta?.warrantyUntil;
  if (warrantyUntil && new Date(warrantyUntil) < new Date()) {
    res.status(403);
    throw new Error(
      `The warranty for "${resourceDoc.name}" expired on ${new Date(warrantyUntil).toLocaleDateString()}. New tickets can no longer be raised for this resource.`
    );
  }

  const ticketNumber = await generateTicketNumber();

  const ticket = await Ticket.create({
    ticketNumber,
    subject,
    client: req.user._id,
    resource,
    resourceType: resourceDoc.type,
    category,
    subcategory,
    dynamicData,
    description,
    attachments: attachments || [],
    priority: priority || 'Medium',
    status: 'Open',
    history: [{ action: 'Ticket created', by: req.user._id }],
  });

  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify({
        user: admin._id,
        title: 'New ticket raised',
        message: `${ticket.ticketNumber} — ${ticket.subject}`,
        type: 'ticket_created',
        ticket: ticket._id,
      })
    )
  );

  const populated = await Ticket.findById(ticket._id).populate(populateOpts);
  res.status(201).json({ success: true, ticket: populated });
});

// @desc    Get tickets (role-scoped, filterable, searchable, paginated)
// @route   GET /api/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'client') filter.client = req.user._id;
  if (req.user.role === 'agent') filter.assignedAgent = req.user._id;

  const OPEN_STATUSES = ['Open', 'Assigned', 'In Progress', 'Pending'];
  const RESOLVED_STATUSES = ['Resolved', 'Closed'];

  if (req.query.status) {
    filter.status = req.query.status;
  } else if (req.query.stage === 'open') {
    filter.status = { $in: OPEN_STATUSES };
  } else if (req.query.stage === 'resolved') {
    filter.status = { $in: RESOLVED_STATUSES };
  } else if (req.query.stage === 'unresolved') {
    filter.status = { $nin: RESOLVED_STATUSES };
  }

  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.assignedAgent) filter.assignedAgent = req.query.assignedAgent;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.unassigned === 'true') filter.assignedAgent = null;

  if (req.query.search) {
    filter.$or = [
      { subject: { $regex: req.query.search, $options: 'i' } },
      { ticketNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate(populateOpts)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: tickets.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    tickets,
  });
});

// @desc    Get a single ticket by id
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(populateOpts);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (req.user.role === 'client' && String(ticket.client._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }
  if (req.user.role === 'agent' && ticket.assignedAgent && String(ticket.assignedAgent._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }

  // Clients never see internal-only notes
  const ticketObj = ticket.toObject();
  if (req.user.role === 'client') {
    ticketObj.messages = ticketObj.messages.filter((m) => !m.isInternal);
  }

  res.json({ success: true, ticket: ticketObj });
});

// @desc    Look up a ticket by its ticket number (used by the chatbot tracker)
// @route   GET /api/tickets/track/:ticketNumber
// @access  Private
const trackTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber })
    .populate('category', 'name icon')
    .select('ticketNumber subject status priority createdAt updatedAt client category');

  if (!ticket) {
    res.status(404);
    throw new Error('No ticket found with that number');
  }
  if (req.user.role === 'client' && String(ticket.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }

  res.json({ success: true, ticket });
});

// @desc    Assign a ticket to an agent
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
const assignTicket = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const agent = await User.findOne({ _id: agentId, role: 'agent' });
  if (!agent) {
    res.status(404);
    throw new Error('Agent not found');
  }

  const previousAgentId = ticket.assignedAgent ? String(ticket.assignedAgent) : null;
  const isReassignment = previousAgentId && previousAgentId !== String(agentId);

  ticket.assignedAgent = agentId;
  if (ticket.status === 'Open') ticket.status = 'Assigned';
  ticket.history.push({
    action: isReassignment ? `Reassigned to ${agent.name}` : `Assigned to ${agent.name}`,
    by: req.user._id,
  });
  await ticket.save();

  if (isReassignment && previousAgentId !== String(agentId)) {
    await notify({
      user: previousAgentId,
      title: 'Ticket reassigned',
      message: `${ticket.ticketNumber} — ${ticket.subject} has been reassigned to ${agent.name}.`,
      type: 'ticket_status',
      ticket: ticket._id,
    });
    await audit({
      actor: req.user,
      action: 'Reassigned ticket',
      entityType: 'Ticket',
      entityId: ticket._id,
      detail: `${ticket.ticketNumber} moved to ${agent.name}`,
    });
  } else {
    await audit({
      actor: req.user,
      action: 'Assigned ticket',
      entityType: 'Ticket',
      entityId: ticket._id,
      detail: `${ticket.ticketNumber} assigned to ${agent.name}`,
    });
  }
  await notify({
    user: agentId,
    title: isReassignment ? 'Ticket reassigned to you' : 'Ticket assigned to you',
    message: `${ticket.ticketNumber} — ${ticket.subject}`,
    type: 'ticket_assigned',
    ticket: ticket._id,
  });
  await notify({
    user: ticket.client,
    title: 'Your ticket was assigned',
    message: `${ticket.ticketNumber} is now being handled by ${agent.name}.`,
    type: 'ticket_status',
    ticket: ticket._id,
  });

  const populated = await Ticket.findById(ticket._id).populate(populateOpts);
  res.json({ success: true, ticket: populated });
});

// @desc    Update ticket status and/or priority
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin/Agent
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, priority } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (status) {
    ticket.status = status;
    ticket.history.push({ action: `Status changed to ${status}`, by: req.user._id });
    if (status === 'Resolved') ticket.resolvedAt = new Date();
    if (status === 'Closed') ticket.closedAt = new Date();
  }
  if (priority) {
    ticket.priority = priority;
    ticket.history.push({ action: `Priority changed to ${priority}`, by: req.user._id });
  }

  await ticket.save();

  await notify({
    user: ticket.client,
    title: 'Ticket status updated',
    message: `${ticket.ticketNumber} is now "${ticket.status}".`,
    type: 'ticket_status',
    ticket: ticket._id,
  });

  const populated = await Ticket.findById(ticket._id).populate(populateOpts);
  res.json({ success: true, ticket: populated });
});

// @desc    Add a reply / internal note to a ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { text, isInternal, attachments } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (req.user.role === 'client' && String(ticket.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to reply to this ticket');
  }

  const internal = req.user.role !== 'client' && !!isInternal;

  ticket.messages.push({
    sender: req.user._id,
    senderRole: req.user.role,
    text,
    attachments: attachments || [],
    isInternal: internal,
  });

  ticket.history.push({
    action: internal ? `Internal note added by ${req.user.name}` : `Reply added by ${req.user.name}`,
    by: req.user._id,
  });

  if (req.user.role === 'client' && ticket.status === 'Pending') {
    ticket.status = 'In Progress';
  }

  await ticket.save();

  if (!internal) {
    if (req.user.role === 'client' && ticket.assignedAgent) {
      await notify({
        user: ticket.assignedAgent,
        title: 'New client reply',
        message: `${ticket.ticketNumber}: ${text.slice(0, 80)}`,
        type: 'ticket_replied',
        ticket: ticket._id,
      });
    } else if (req.user.role !== 'client') {
      await notify({
        user: ticket.client,
        title: 'New reply on your ticket',
        message: `${ticket.ticketNumber}: ${text.slice(0, 80)}`,
        type: 'ticket_replied',
        ticket: ticket._id,
      });
    }
  } else {
    // Internal notes are the admin<->agent communication channel for a ticket.
    // Notify whichever staff side didn't write the note.
    if (req.user.role === 'agent' && ticket.assignedAgent) {
      const admins = await User.find({ role: 'admin' }).select('_id');
      await Promise.all(
        admins.map((admin) =>
          notify({
            user: admin._id,
            title: `Internal note from ${req.user.name}`,
            message: `${ticket.ticketNumber}: ${text.slice(0, 80)}`,
            type: 'ticket_replied',
            ticket: ticket._id,
          })
        )
      );
    } else if (req.user.role === 'admin' && ticket.assignedAgent) {
      await notify({
        user: ticket.assignedAgent,
        title: `Internal note from Admin`,
        message: `${ticket.ticketNumber}: ${text.slice(0, 80)}`,
        type: 'ticket_replied',
        ticket: ticket._id,
      });
    }
  }

  const populated = await Ticket.findById(ticket._id).populate(populateOpts);
  res.json({ success: true, ticket: populated });
});

const REOPEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// @desc    Client reopens a resolved/closed ticket within the allowed window
// @route   PUT /api/tickets/:id/reopen
// @access  Private/Client
const reopenTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  if (String(ticket.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to reopen this ticket');
  }
  if (!['Resolved', 'Closed'].includes(ticket.status)) {
    res.status(400);
    throw new Error('Only resolved or closed tickets can be reopened');
  }
  const closedAt = ticket.resolvedAt || ticket.closedAt || ticket.updatedAt;
  if (Date.now() - new Date(closedAt).getTime() > REOPEN_WINDOW_MS) {
    res.status(400);
    throw new Error('This ticket can no longer be reopened — it has been more than 7 days since it was resolved');
  }

  ticket.status = 'In Progress';
  ticket.resolvedAt = undefined;
  ticket.closedAt = undefined;
  ticket.isEscalated = false;
  ticket.reopenCount += 1;
  ticket.history.push({ action: `Reopened by ${req.user.name}`, by: req.user._id });
  await ticket.save();

  if (ticket.assignedAgent) {
    await notify({
      user: ticket.assignedAgent,
      title: 'Ticket reopened',
      message: `${ticket.ticketNumber} was reopened by the client and needs another look.`,
      type: 'ticket_status',
      ticket: ticket._id,
    });
  }

  const populated = await Ticket.findById(ticket._id).populate(populateOpts);
  res.json({ success: true, ticket: populated });
});

// @desc    Client submits a satisfaction rating for a resolved/closed ticket
// @route   POST /api/tickets/:id/rating
// @access  Private/Client
const submitRating = asyncHandler(async (req, res) => {
  const { stars, comment } = req.body;
  if (!stars || stars < 1 || stars > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5 stars');
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  if (String(ticket.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to rate this ticket');
  }
  if (!['Resolved', 'Closed'].includes(ticket.status)) {
    res.status(400);
    throw new Error('You can only rate a ticket once it has been resolved');
  }
  if (ticket.rating?.stars) {
    res.status(400);
    throw new Error('This ticket has already been rated');
  }

  ticket.rating = { stars, comment: comment || '', submittedAt: new Date() };
  ticket.history.push({ action: `Rating submitted: ${stars}★`, by: req.user._id });
  await ticket.save();

  if (ticket.assignedAgent) {
    await notify({
      user: ticket.assignedAgent,
      title: 'You received a rating',
      message: `${ticket.ticketNumber} was rated ${stars}★ by the client.`,
      type: 'general',
      ticket: ticket._id,
    });
  }

  const populated = await Ticket.findById(ticket._id).populate(populateOpts);
  res.json({ success: true, ticket: populated });
});

// @desc    Export tickets matching the current filters as CSV
// @route   GET /api/tickets/export
// @access  Private/Admin
const exportTicketsCsv = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.assignedAgent) filter.assignedAgent = req.query.assignedAgent;

  const tickets = await Ticket.find(filter)
    .populate('client', 'name email company')
    .populate('assignedAgent', 'name')
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Ticket Number', 'Subject', 'Client', 'Category', 'Subcategory', 'Priority', 'Status', 'Assigned Agent', 'Rating', 'Created At', 'Resolved At'];
  const rows = tickets.map((t) => [
    t.ticketNumber,
    t.subject,
    t.client?.name || '',
    t.category?.name || '',
    t.subcategory,
    t.priority,
    t.status,
    t.assignedAgent?.name || 'Unassigned',
    t.rating?.stars ? `${t.rating.stars}` : '',
    new Date(t.createdAt).toISOString(),
    t.resolvedAt ? new Date(t.resolvedAt).toISOString() : '',
  ].map(escape).join(','));

  const csv = [header.map(escape).join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="tickets-export-${Date.now()}.csv"`);
  res.send(csv);
});

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  trackTicket,
  assignTicket,
  updateTicketStatus,
  addMessage,
  reopenTicket,
  submitRating,
  exportTicketsCsv,
};
