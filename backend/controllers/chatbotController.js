const asyncHandler = require('../utils/asyncHandler');
const Faq = require('../models/Faq');
const Ticket = require('../models/Ticket');
const Resource = require('../models/Resource');
const User = require('../models/User');

// @desc    Get active FAQs for the chatbot's quick-answer menu
// @route   GET /api/chatbot/faqs
// @access  Private
const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({ isActive: true }).sort({ createdAt: 1 });
  res.json({ success: true, faqs });
});

const STOPWORDS = new Set([
  'what', 'is', 'the', 'of', 'on', 'for', 'a', 'an', 'my', 'warranty', 'about', 'tell', 'me',
  'whats', "what's", 'status', 'and', 'to', 'in',
]);

const describeWarranty = (resource) => {
  const until = resource.meta?.warrantyUntil;
  if (!until) return `"${resource.name}" doesn't have a warranty date on file.`;
  const expired = new Date(until) < new Date();
  const dateLabel = new Date(until).toLocaleDateString();
  return expired
    ? `The warranty for "${resource.name}" expired on ${dateLabel}. New tickets can't be raised for it until coverage is renewed.`
    : `"${resource.name}" is covered until ${dateLabel}.`;
};

// Tries to resolve a resource the person is asking about from free text,
// scoped to what that role is allowed to see.
const findResourceMention = async (text, user) => {
  const scope = user.role === 'client' ? { client: user._id } : {};
  const resources = await Resource.find(scope);
  if (resources.length === 0) return { resources: [] };

  const words = text
    .replace(/[?.,!]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()));

  const matches = resources.filter((r) => {
    const nameLower = r.name.toLowerCase();
    return words.some((w) => nameLower.includes(w.toLowerCase())) || text.toLowerCase().includes(nameLower);
  });

  return { resources: matches };
};

// @desc    Role-aware bot reply: ticket tracking, warranty lookups, live
//          analytics for staff, and FAQ keyword matching as a fallback.
// @route   POST /api/chatbot/ask
// @access  Private
const askBot = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const text = (message || '').toLowerCase().trim();
  const { role } = req.user;

  // 1. Ticket number lookup — works for every role
  const ticketMatch = text.match(/tkt-\d{4}-\d{4}/i);
  if (ticketMatch) {
    const ticket = await Ticket.findOne({ ticketNumber: ticketMatch[0].toUpperCase() }).select(
      'ticketNumber subject status priority createdAt client assignedAgent'
    );
    if (!ticket) {
      return res.json({ success: true, kind: 'text', reply: `I couldn't find a ticket with number ${ticketMatch[0].toUpperCase()}. Please double-check the number.` });
    }
    if (role === 'client' && String(ticket.client) !== String(req.user._id)) {
      return res.json({ success: true, kind: 'text', reply: `I couldn't find that ticket under your account.` });
    }
    if (role === 'agent' && ticket.assignedAgent && String(ticket.assignedAgent) !== String(req.user._id)) {
      return res.json({ success: true, kind: 'text', reply: `That ticket isn't currently assigned to you, but here's its status anyway: ${ticket.status} (priority: ${ticket.priority}).` });
    }
    return res.json({
      success: true,
      kind: 'ticket_status',
      reply: `Ticket ${ticket.ticketNumber} — "${ticket.subject}" is currently ${ticket.status} (priority: ${ticket.priority}).`,
      ticket,
    });
  }

  // 2. Warranty lookups — "what's the warranty on X" / "is X still covered"
  if (text.includes('warranty') || text.includes('covered') || text.includes('coverage')) {
    const { resources } = await findResourceMention(text, req.user);
    if (resources.length === 1) {
      return res.json({ success: true, kind: 'text', reply: describeWarranty(resources[0]) });
    }
    if (resources.length > 1) {
      const names = resources.map((r) => `"${r.name}"`).join(', ');
      return res.json({ success: true, kind: 'text', reply: `I found a few matching resources: ${names}. Could you mention the exact name?` });
    }
    return res.json({
      success: true,
      kind: 'text',
      reply: role === 'client'
        ? "I couldn't match that to one of your resources. Try naming it exactly as it appears under \"My Resources\"."
        : "I couldn't match that to a resource. Try including its exact name.",
    });
  }

  // 3. Admin: live organization analytics
  if (role === 'admin') {
    if (text.includes('unassigned')) {
      const count = await Ticket.countDocuments({ assignedAgent: null, status: { $nin: ['Resolved', 'Closed'] } });
      return res.json({ success: true, kind: 'text', reply: `There ${count === 1 ? 'is' : 'are'} currently ${count} unassigned ticket${count === 1 ? '' : 's'} needing triage.` });
    }
    if (text.includes('critical')) {
      const count = await Ticket.countDocuments({ priority: 'Critical', status: { $nin: ['Resolved', 'Closed'] } });
      return res.json({ success: true, kind: 'text', reply: `There ${count === 1 ? 'is' : 'are'} ${count} unresolved Critical-priority ticket${count === 1 ? '' : 's'} right now.` });
    }
    if (text.includes('how many agent')) {
      const count = await User.countDocuments({ role: 'agent' });
      return res.json({ success: true, kind: 'text', reply: `You currently have ${count} agent${count === 1 ? '' : 's'} on the team.` });
    }
    if (text.includes('how many client')) {
      const count = await User.countDocuments({ role: 'client' });
      return res.json({ success: true, kind: 'text', reply: `You currently have ${count} client${count === 1 ? '' : 's'}.` });
    }
    if (text.includes('open ticket') || (text.includes('how many') && text.includes('open'))) {
      const count = await Ticket.countDocuments({ status: { $in: ['Open', 'Assigned', 'In Progress', 'Pending'] } });
      return res.json({ success: true, kind: 'text', reply: `There are ${count} tickets currently open across the organization.` });
    }
    if (text.includes('how many ticket')) {
      const count = await Ticket.countDocuments();
      return res.json({ success: true, kind: 'text', reply: `There are ${count} tickets on record in total.` });
    }
  }

  // 4. Agent: live personal workload
  if (role === 'agent') {
    if (text.includes('my critical')) {
      const count = await Ticket.countDocuments({ assignedAgent: req.user._id, priority: 'Critical', status: { $nin: ['Resolved', 'Closed'] } });
      return res.json({ success: true, kind: 'text', reply: `You have ${count} unresolved Critical ticket${count === 1 ? '' : 's'} assigned to you.` });
    }
    if (text.includes('my open') || (text.includes('assigned to me') && text.includes('open'))) {
      const count = await Ticket.countDocuments({ assignedAgent: req.user._id, status: { $nin: ['Resolved', 'Closed'] } });
      return res.json({ success: true, kind: 'text', reply: `You have ${count} open ticket${count === 1 ? '' : 's'} in your queue.` });
    }
    if (text.includes('my ticket') || text.includes('assigned to me')) {
      const count = await Ticket.countDocuments({ assignedAgent: req.user._id });
      return res.json({ success: true, kind: 'text', reply: `You have ${count} ticket${count === 1 ? '' : 's'} assigned to you in total.` });
    }
  }

  // 5. FAQ keyword matching fallback
  const faqs = await Faq.find({ isActive: true });
  const match = faqs.find((f) => f.keywords.some((k) => text.includes(k.toLowerCase())));
  if (match) {
    return res.json({ success: true, kind: 'text', reply: match.answer });
  }

  const fallback = {
    admin: "I'm not sure about that one yet. Try asking about unassigned tickets, critical tickets, agent/client counts, or a resource's warranty.",
    agent: "I'm not sure about that one yet. Try asking about your assigned tickets, a ticket number, or a resource's warranty.",
    client: "I'm not totally sure about that one. You can raise a support ticket and a specialist will help, or try asking about ticket status, plans, or a resource's warranty.",
  };

  res.json({ success: true, kind: 'text', reply: fallback[role] || fallback.client });
});

module.exports = { getFaqs, askBot };
