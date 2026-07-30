const STYLES = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-brand-50 text-brand-700',
  High: 'bg-amber-400/15 text-amber-500',
  Critical: 'bg-rose-500/15 text-rose-500',
};

const PriorityBadge = ({ priority }) => (
  <span className={`badge ${STYLES[priority] || 'bg-gray-100 text-gray-600'}`}>{priority}</span>
);

export default PriorityBadge;
