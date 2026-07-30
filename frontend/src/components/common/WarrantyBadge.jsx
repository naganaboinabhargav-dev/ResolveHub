import { differenceInCalendarDays } from 'date-fns';

// Shows nothing if no warranty is set, otherwise a color-coded badge:
// expired (rose), expiring within 30 days (amber), or healthy (teal).
const WarrantyBadge = ({ warrantyUntil }) => {
  if (!warrantyUntil) return <span className="text-xs text-muted">—</span>;

  const daysLeft = differenceInCalendarDays(new Date(warrantyUntil), new Date());
  const dateLabel = new Date(warrantyUntil).toLocaleDateString();

  if (daysLeft < 0) {
    return <span className="badge bg-rose-500/10 text-rose-500">Expired · {dateLabel}</span>;
  }
  if (daysLeft <= 30) {
    return <span className="badge bg-amber-400/15 text-amber-500">Expires soon · {dateLabel}</span>;
  }
  return <span className="badge bg-teal-500/10 text-teal-600">Valid until {dateLabel}</span>;
};

export default WarrantyBadge;
