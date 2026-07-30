const STYLES = {
  Open: 'bg-brand-50 text-brand-700',
  Assigned: 'bg-indigo-50 text-indigo-700',
  'In Progress': 'bg-amber-400/15 text-amber-500',
  Pending: 'bg-orange-50 text-orange-600',
  Resolved: 'bg-teal-500/15 text-teal-600',
  Closed: 'bg-gray-100 text-gray-500',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);

export default StatusBadge;
