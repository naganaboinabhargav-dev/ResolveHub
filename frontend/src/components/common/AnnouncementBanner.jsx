import { useEffect, useState } from 'react';
import { FiX, FiRadio } from 'react-icons/fi';
import api from '../../api/axios';

const PRIORITY_STYLES = {
  Low: 'border-line bg-paper text-ink/80',
  Medium: 'border-brand-300/40 bg-brand-50 text-brand-800',
  High: 'border-rose-300/50 bg-rose-500/10 text-rose-700',
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    api.get('/announcements').then(({ data }) => setAnnouncements(data.announcements));
  }, []);

  const visible = announcements.filter((a) => !dismissed.includes(a._id));
  if (visible.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {visible.map((a) => (
        <div key={a._id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.Medium}`}>
          <FiRadio className="mt-0.5 shrink-0" size={16} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="text-sm opacity-90">{a.message}</p>
          </div>
          <button onClick={() => setDismissed((d) => [...d, a._id])} className="shrink-0 rounded p-1 opacity-60 hover:opacity-100">
            <FiX size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementBanner;
