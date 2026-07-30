import { format } from 'date-fns';
import {
  FiPlusCircle, FiUserPlus, FiRefreshCw, FiActivity, FiMessageSquare,
  FiLock, FiCheckCircle, FiRotateCcw, FiStar, FiAlertTriangle,
} from 'react-icons/fi';

const iconFor = (action) => {
  if (action.includes('created')) return { Icon: FiPlusCircle, color: 'text-brand-500 bg-brand-50' };
  if (action.includes('Reassigned')) return { Icon: FiRefreshCw, color: 'text-indigo-500 bg-indigo-50' };
  if (action.includes('Assigned')) return { Icon: FiUserPlus, color: 'text-indigo-500 bg-indigo-50' };
  if (action.includes('Status changed')) return { Icon: FiActivity, color: 'text-amber-500 bg-amber-50' };
  if (action.includes('Priority changed')) return { Icon: FiAlertTriangle, color: 'text-amber-500 bg-amber-50' };
  if (action.includes('Internal note')) return { Icon: FiLock, color: 'text-amber-600 bg-amber-50' };
  if (action.includes('Reply added')) return { Icon: FiMessageSquare, color: 'text-brand-500 bg-brand-50' };
  if (action.includes('Reopened')) return { Icon: FiRotateCcw, color: 'text-rose-500 bg-rose-50' };
  if (action.includes('Rating')) return { Icon: FiStar, color: 'text-amber-500 bg-amber-50' };
  if (action.includes('Escalated')) return { Icon: FiAlertTriangle, color: 'text-rose-500 bg-rose-50' };
  return { Icon: FiCheckCircle, color: 'text-teal-500 bg-teal-50' };
};

const TicketTimeline = ({ history = [] }) => {
  if (history.length === 0) return <p className="text-sm text-muted">No activity recorded yet.</p>;

  const sorted = [...history].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <div className="space-y-0">
      {sorted.map((h, i) => {
        const { Icon, color } = iconFor(h.action);
        return (
          <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i !== sorted.length - 1 && <div className="absolute left-[15px] top-8 h-full w-px bg-line" />}
            <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
              <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm text-ink">{h.action}</p>
              <p className="text-xs text-muted">
                {h.by?.name ? `${h.by.name} · ` : ''}{format(new Date(h.at), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketTimeline;
