import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goToTicket = (n) => {
    markAsRead(n._id);
    setOpen(false);
    if (n.ticket) navigate(`/${user.role}/tickets/${n.ticket}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-ink/70 hover:bg-black/5 hover:text-ink transition"
      >
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 card p-0 animate-fadeUp overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h4 className="font-display text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-medium text-brand-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n._id}
                  onClick={() => goToTicket(n)}
                  className={`block w-full border-b border-line/60 px-4 py-3 text-left text-sm transition hover:bg-brand-50/50 ${
                    !n.isRead ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{n.title}</p>
                      <p className="truncate text-xs text-muted">{n.message}</p>
                      <p className="mt-0.5 text-[11px] text-muted/70">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => { setOpen(false); navigate(`/${user.role}/notifications`); }}
            className="block w-full border-t border-line bg-paper/40 px-4 py-2.5 text-center text-xs font-semibold text-brand-600 hover:bg-paper"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
