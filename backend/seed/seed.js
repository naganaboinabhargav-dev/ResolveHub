const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Category = require('../models/Category');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const Faq = require('../models/Faq');
const Message = require('../models/Message');
const SavedResponse = require('../models/SavedResponse');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const generateTicketNumber = require('../utils/ticketNumber');
const { categories, faqs } = require('./data');

const destroy = process.argv.includes('--destroy');

const run = async () => {
  await connectDB();

  if (destroy) {
    await Promise.all([
      User.deleteMany(),
      Resource.deleteMany(),
      Category.deleteMany(),
      Ticket.deleteMany(),
      Notification.deleteMany(),
      Faq.deleteMany(),
      Message.deleteMany(),
      SavedResponse.deleteMany(),
      Announcement.deleteMany(),
      AuditLog.deleteMany(),
    ]);
    console.log('All collections cleared.');
    process.exit(0);
  }

  await Promise.all([
    User.deleteMany(),
    Resource.deleteMany(),
    Category.deleteMany(),
    Ticket.deleteMany(),
    Notification.deleteMany(),
    Faq.deleteMany(),
    Message.deleteMany(),
    SavedResponse.deleteMany(),
    Announcement.deleteMany(),
    AuditLog.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Ava Sterling',
    email: 'admin@resolvehub.com',
    password: 'Admin@123',
    role: 'admin',
    company: 'ResolveHub HQ',
  });

  const agents = await User.create([
    { name: 'Marcus Reyes', email: 'agent1@resolvehub.com', password: 'Agent@123', role: 'agent' },
    { name: 'Priya Nair', email: 'agent2@resolvehub.com', password: 'Agent@123', role: 'agent' },
    { name: 'Tom Baxter', email: 'agent3@resolvehub.com', password: 'Agent@123', role: 'agent' },
  ]);

  const clients = await User.create([
    { name: 'Elena Volkov', email: 'client1@resolvehub.com', password: 'Client@123', role: 'client', company: 'Nimbus Retail', plan: 'premium' },
    { name: 'Daniel Osei', email: 'client2@resolvehub.com', password: 'Client@123', role: 'client', company: 'Fjord Logistics', plan: 'basic' },
    { name: 'Sara Kim', email: 'client3@resolvehub.com', password: 'Client@123', role: 'client', company: 'Kim & Partners', plan: 'basic' },
    { name: 'Liam O\'Connor', email: 'client4@resolvehub.com', password: 'Client@123', role: 'client', company: 'Atlas Manufacturing', plan: 'premium' },
  ]);

  const createdCategories = await Category.create(categories);
  await Faq.create(faqs);

  const resources = await Resource.create([
    { name: 'Nimbus POS Terminal', type: 'product', client: clients[0]._id, description: 'In-store point-of-sale hardware and software bundle.', meta: { serialNumber: 'NPX-88213' }, createdBy: admin._id },
    { name: 'Cloud Analytics Suite', type: 'service', client: clients[0]._id, description: 'Managed analytics dashboard subscription.', meta: { subscriptionId: 'SUB-4471' }, createdBy: admin._id },
    { name: 'Fleet Tracking Rollout', type: 'project', client: clients[1]._id, description: 'Implementation of GPS fleet tracking across 40 vehicles.', createdBy: admin._id },
    { name: 'Warehouse Management System', type: 'product', client: clients[1]._id, description: 'On-premise warehouse inventory software.', meta: { serialNumber: 'WMS-2291' }, createdBy: admin._id },
    { name: 'Legal Document Portal', type: 'service', client: clients[2]._id, description: 'Secure client document exchange portal.', meta: { subscriptionId: 'SUB-9021' }, createdBy: admin._id },
    { name: 'ERP Migration', type: 'project', client: clients[3]._id, description: 'Migration from legacy ERP to cloud ERP platform.', createdBy: admin._id },
    { name: 'Factory IoT Sensors', type: 'product', client: clients[3]._id, description: 'Predictive maintenance sensor network.', meta: { serialNumber: 'IOT-6620' }, createdBy: admin._id },
  ]);

  const bugCat = createdCategories.find((c) => c.name === 'Bug Report');
  const billingCat = createdCategories.find((c) => c.name === 'Billing & Invoicing');
  const accessCat = createdCategories.find((c) => c.name === 'Account & Access');
  const techCat = createdCategories.find((c) => c.name === 'Technical Support');
  const featureCat = createdCategories.find((c) => c.name === 'Feature Request');
  const milestoneCat = createdCategories.find((c) => c.name === 'Project Milestone');

  const ticketSeeds = [
    {
      subject: 'POS terminal freezes during checkout',
      client: clients[0]._id, resource: resources[0]._id, resourceType: 'product',
      category: bugCat._id, subcategory: 'Crash / Error',
      description: 'The terminal freezes intermittently when processing card payments over $200, requiring a manual restart.',
      dynamicData: { steps: 'Ring up cart > 200 USD > pay by card > freeze', severity: 'Blocking' },
      priority: 'Critical', status: 'In Progress', assignedAgent: agents[0]._id,
    },
    {
      subject: 'Question about last month\'s invoice',
      client: clients[0]._id, resource: resources[1]._id, resourceType: 'service',
      category: billingCat._id, subcategory: 'Invoice Query',
      description: 'Invoice #INV-2291 shows an extra line item we do not recognize.',
      dynamicData: { invoiceNumber: 'INV-2291' },
      priority: 'Low', status: 'Resolved', assignedAgent: agents[1]._id,
    },
    {
      subject: 'Cannot log in after password reset',
      client: clients[1]._id, resource: resources[3]._id, resourceType: 'product',
      category: accessCat._id, subcategory: 'Login Issue',
      description: 'Reset my password via email link but the new password is rejected on login.',
      dynamicData: { affectedAccount: 'ops@fjordlogistics.com' },
      priority: 'High', status: 'Open',
    },
    {
      subject: 'Fleet tracking rollout - Phase 2 delay',
      client: clients[1]._id, resource: resources[2]._id, resourceType: 'project',
      category: milestoneCat._id, subcategory: 'Deadline Extension',
      description: 'We need to push Phase 2 installation back two weeks due to vehicle availability.',
      dynamicData: { milestone: 'Phase 2 Installation' },
      priority: 'Medium', status: 'Assigned', assignedAgent: agents[2]._id,
    },
    {
      subject: 'API rate limit errors on document upload',
      client: clients[2]._id, resource: resources[4]._id, resourceType: 'service',
      category: techCat._id, subcategory: 'API Support',
      description: 'Getting 429 errors when uploading more than 10 documents in a batch.',
      dynamicData: { errorMessage: 'HTTP 429 Too Many Requests', environment: 'Production' },
      priority: 'High', status: 'In Progress', assignedAgent: agents[0]._id,
    },
    {
      subject: 'Request: bulk export for case documents',
      client: clients[2]._id, resource: resources[4]._id, resourceType: 'service',
      category: featureCat._id, subcategory: 'New Feature',
      description: 'It would help our team to export all documents for a case in a single zip file.',
      dynamicData: { justification: 'Saves paralegal time during discovery.' },
      priority: 'Low', status: 'Open',
    },
    {
      subject: 'ERP migration - data mapping question',
      client: clients[3]._id, resource: resources[5]._id, resourceType: 'project',
      category: techCat._id, subcategory: 'Configuration',
      description: 'Need clarification on how custom fields map from the legacy ERP to the new schema.',
      dynamicData: { environment: 'Staging' },
      priority: 'Medium', status: 'Pending', assignedAgent: agents[1]._id,
    },
    {
      subject: 'IoT sensor readings dropping out overnight',
      client: clients[3]._id, resource: resources[6]._id, resourceType: 'product',
      category: bugCat._id, subcategory: 'Performance',
      description: 'Sensors on Line 3 stop reporting between 1-4am consistently.',
      dynamicData: { steps: 'Monitor dashboard overnight', severity: 'Data loss' },
      priority: 'Critical', status: 'Closed', assignedAgent: agents[2]._id,
    },
  ];

  for (const seed of ticketSeeds) {
    const ticketNumber = await generateTicketNumber();
    const ticket = await Ticket.create({
      ...seed,
      ticketNumber,
      messages: [
        {
          sender: seed.client,
          senderRole: 'client',
          text: seed.description,
          createdAt: new Date(),
        },
      ],
      history: [{ action: 'Ticket created', by: seed.client }],
    });

    if (seed.assignedAgent) {
      ticket.messages.push({
        sender: seed.assignedAgent,
        senderRole: 'agent',
        text: 'Thanks for reaching out — we are looking into this now and will update you shortly.',
        createdAt: new Date(),
      });
      await ticket.save();
    }
  }

  await SavedResponse.create([
    { title: 'Password reset instructions', body: 'Hi! To reset your password, go to Profile > Change Password. If you\'re locked out, let us know and we\'ll help directly.', scope: 'global', createdBy: admin._id },
    { title: 'Investigating', body: 'Thanks for the report — we\'re actively investigating this and will update you as soon as we know more.', scope: 'global', createdBy: admin._id },
    { title: 'Issue resolved', body: 'This should now be resolved on our end. Please confirm on your side and let us know if anything still looks off!', scope: 'personal', createdBy: agents[0]._id },
  ]);

  await Announcement.create({
    title: 'Welcome to ResolveHub',
    message: 'This is a demo announcement banner — admins can publish updates here for clients, agents, or everyone.',
    audience: 'all',
    priority: 'Medium',
    startDate: new Date(),
    pinned: true,
    createdBy: admin._id,
  });

  console.log('\nSeed complete! Sample credentials:\n');
  console.log('  Admin  -> admin@resolvehub.com / Admin@123');
  console.log('  Agent  -> agent1@resolvehub.com / Agent@123');
  console.log('  Client -> client1@resolvehub.com / Client@123\n');

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
