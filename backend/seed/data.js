const categories = [
  {
    name: 'Bug Report',
    icon: '🐞',
    description: 'Something is not working as expected.',
    subcategories: ['UI Glitch', 'Crash / Error', 'Data Issue', 'Performance'],
    applicableResourceTypes: ['product', 'service', 'project'],
    dynamicFields: [
      { label: 'Steps to reproduce', name: 'steps', type: 'textarea', required: true },
      { label: 'Browser / Device', name: 'device', type: 'text', required: false },
      { label: 'Severity', name: 'severity', type: 'select', options: ['Cosmetic', 'Blocking', 'Data loss'], required: true },
    ],
  },
  {
    name: 'Feature Request',
    icon: '💡',
    description: 'Suggest an improvement or a new capability.',
    subcategories: ['New Feature', 'Enhancement', 'Integration Request'],
    applicableResourceTypes: ['product', 'service', 'project'],
    dynamicFields: [
      { label: 'Business justification', name: 'justification', type: 'textarea', required: true },
      { label: 'Desired timeline', name: 'timeline', type: 'date', required: false },
    ],
  },
  {
    name: 'Billing & Invoicing',
    icon: '💳',
    description: 'Questions about invoices, payments, and plans.',
    subcategories: ['Invoice Query', 'Refund Request', 'Plan Upgrade', 'Payment Failure'],
    applicableResourceTypes: ['product', 'service', 'project'],
    dynamicFields: [
      { label: 'Invoice number', name: 'invoiceNumber', type: 'text', required: false },
      { label: 'Amount in question', name: 'amount', type: 'number', required: false },
    ],
  },
  {
    name: 'Account & Access',
    icon: '🔐',
    description: 'Login, permissions, and account management.',
    subcategories: ['Login Issue', 'Permission Request', 'Account Setup', 'MFA Reset'],
    applicableResourceTypes: ['product', 'service'],
    dynamicFields: [
      { label: 'Affected email / username', name: 'affectedAccount', type: 'text', required: true },
    ],
  },
  {
    name: 'Technical Support',
    icon: '🛠️',
    description: 'General technical assistance and troubleshooting.',
    subcategories: ['Installation', 'Configuration', 'Connectivity', 'API Support'],
    applicableResourceTypes: ['product', 'service', 'project'],
    dynamicFields: [
      { label: 'Error message (if any)', name: 'errorMessage', type: 'textarea', required: false },
      { label: 'Environment', name: 'environment', type: 'select', options: ['Production', 'Staging', 'Development'], required: true },
    ],
  },
  {
    name: 'Project Milestone',
    icon: '📌',
    description: 'Updates, delays, or questions related to a project deliverable.',
    subcategories: ['Deadline Extension', 'Scope Change', 'Status Update', 'Resource Request'],
    applicableResourceTypes: ['project'],
    dynamicFields: [
      { label: 'Milestone name', name: 'milestone', type: 'text', required: true },
      { label: 'Proposed new date', name: 'proposedDate', type: 'date', required: false },
    ],
  },
  {
    name: 'Service Cancellation',
    icon: '🚪',
    description: 'Requests to pause, downgrade, or cancel a service.',
    subcategories: ['Pause Subscription', 'Downgrade', 'Full Cancellation'],
    applicableResourceTypes: ['service', 'product'],
    dynamicFields: [
      { label: 'Reason for cancellation', name: 'reason', type: 'textarea', required: true },
    ],
  },
  {
    name: 'General Inquiry',
    icon: '💬',
    description: 'Anything that does not fit the categories above.',
    subcategories: ['General Question', 'Feedback', 'Partnership'],
    applicableResourceTypes: ['product', 'service', 'project'],
    dynamicFields: [],
  },
];

const faqs = [
  {
    question: 'How do I raise a new ticket?',
    answer: 'Go to "My Tickets" in your dashboard and click "New Ticket". Pick the resource, category, and describe your issue — we will route it to the right specialist.',
    keywords: ['raise ticket', 'new ticket', 'create ticket', 'how to submit', 'open a ticket', 'submit a ticket'],
  },
  {
    question: 'How can I track my ticket status?',
    answer: 'Type your ticket number (e.g. TKT-2026-0001) here and I will look up its live status for you, or check "My Tickets" in your dashboard.',
    keywords: ['track', 'status', 'where is my ticket', 'ticket number', 'progress'],
  },
  {
    question: 'What is the difference between Basic and Premium plans?',
    answer: 'Premium plans get priority routing, faster SLA targets, and access to dedicated senior agents. Basic plans cover full support with standard response times.',
    keywords: ['plan', 'premium', 'basic', 'upgrade', 'pricing'],
  },
  {
    question: 'How long does it take to get a response?',
    answer: 'Critical issues are typically triaged within 1 hour, High within 4 hours, and Medium/Low within 1 business day, depending on your plan.',
    keywords: ['response time', 'sla', 'how long', 'wait time', 'turnaround'],
  },
  {
    question: 'Can I attach files to a ticket?',
    answer: 'Yes — you can attach screenshots, logs, or documents (up to 5MB each) when creating a ticket or replying to one.',
    keywords: ['attach', 'file', 'screenshot', 'upload', 'document'],
  },
  {
    question: 'What happens once my resource\'s warranty expires?',
    answer: 'Once a resource\'s warranty date passes, new tickets can no longer be raised against it. Reach out to your account manager to renew coverage — you can ask me "what is the warranty on <resource name>" any time to check.',
    keywords: ['warranty', 'coverage', 'expired', 'renew'],
  },
  {
    question: 'How do priority levels work?',
    answer: 'Tickets can be Low, Medium, High, or Critical. Critical is reserved for outages or data-loss issues and gets triaged first; priority can be adjusted by an admin or agent as more detail comes in.',
    keywords: ['priority', 'urgent', 'critical', 'severity'],
  },
  {
    question: 'How do ticket statuses work?',
    answer: 'Tickets move through Open → Assigned → In Progress → Pending → Resolved → Closed. "Pending" usually means we\'re waiting on more info from you.',
    keywords: ['status meaning', 'what does open mean', 'what does pending mean', 'ticket stages', 'workflow'],
  },
  {
    question: 'Can I message someone directly outside of a ticket?',
    answer: 'Yes — use the "Messages" tab in your sidebar. Clients and agents can message the Admin team directly, and admins can message any agent or client.',
    keywords: ['message', 'chat', 'contact admin', 'direct message', 'dm'],
  },
  {
    question: 'How do I change my password?',
    answer: 'Go to your Profile page and use the "Change password" form. For security, only you can change your own password — admins can\'t reset it for you.',
    keywords: ['password', 'change password', 'forgot password', 'reset password'],
  },
  {
    question: 'Where can I see all my notifications?',
    answer: 'Click the bell icon in the top bar for recent updates, or open the "Notifications" tab in your sidebar for your full history.',
    keywords: ['notification', 'alerts', 'updates', 'bell'],
  },
  {
    question: 'What are internal notes?',
    answer: 'Internal notes are messages admins and agents leave on a ticket that clients never see — used to coordinate on tricky issues before replying to the client.',
    keywords: ['internal note', 'private note', 'staff only'],
  },
];

module.exports = { categories, faqs };
