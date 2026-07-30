import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { FiCheckCircle, FiTag, FiUserPlus, FiMessageCircle, FiActivity, FiBell } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/common/EmptyState';

const ICONS = {
  ticket_created: FiTag,
  ticket_assigned: FiUserPlus,
  ticket_replied: FiMessageCircle,
  ticket_status: FiActivity,
  ticket_escalated: FiActivity,
  ticket_closed: FiCheckCircle,
  user_created: FiUserPlus,
  general: FiBell,
};

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, []);

  const handleClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.ticket) navigate(`/${user.role}/tickets/${n.ticket}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
          <p className="text-sm text-muted">Your complete notification history{unreadCount > 0 ? ` — ${unreadCount} unread` : ''}.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-outline">Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications yet" subtitle="You'll see ticket updates, assignments, and messages here." />
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || FiBell;
            return (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-paper/60 ${!n.isRead ? 'bg-brand-50/30' : ''}`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!n.isRead ? 'bg-brand-500 text-white' : 'bg-paper text-muted'}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink">{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-muted/70" title={format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
