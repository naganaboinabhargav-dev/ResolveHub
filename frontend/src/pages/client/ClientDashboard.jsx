import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLifeBuoy, FiCheckCircle, FiClock, FiPlus } from 'react-icons/fi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import AnnouncementBanner from '../../components/common/AnnouncementBanner';

const STATUS_COLORS = { Open: '#5B5FEE', Assigned: '#818CF8', 'In Progress': '#FFB020', Pending: '#FB923C', Resolved: '#17B897', Closed: '#9CA3AF' };

const ClientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analytics/dashboard').then(({ data }) => setStats(data));
    api.get('/tickets', { params: { limit: 5 } }).then(({ data }) => setRecent(data.tickets));
  }, []);

  if (!stats) return <Loader label="Loading your dashboard..." />;
  const { totals, byStatus } = stats;

  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Dashboard</h1>
          <p className="text-sm text-muted">A quick overview of your support activity.</p>
        </div>
        <Link to="/client/tickets" className="btn-primary"><FiPlus /> New ticket</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={FiLifeBuoy} label="Total tickets" value={totals.all} tint="brand" onClick={() => navigate('/client/tickets')} />
        <StatCard icon={FiClock} label="Open" value={totals.open} tint="amber" onClick={() => navigate('/client/tickets?stage=open')} />
        <StatCard icon={FiCheckCircle} label="Resolved" value={totals.resolved} tint="teal" onClick={() => navigate('/client/tickets?stage=resolved')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Status breakdown</h3>
          {byStatus.length === 0 ? (
            <p className="text-sm text-muted">No tickets yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {byStatus.map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#9CA3AF'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink">Recent tickets</h3>
            <Link to="/client/tickets" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
          </div>
          {!recent ? (
            <Loader />
          ) : recent.length === 0 ? (
            <EmptyState icon="🎫" title="No tickets yet" subtitle="Raise your first ticket to get started." />
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <Link key={t._id} to={`/client/tickets/${t._id}`} className="flex items-center justify-between rounded-xl border border-line p-3 transition hover:border-brand-300">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-brand-600">{t.ticketNumber}</p>
                    <p className="truncate text-sm font-medium text-ink">{t.subject}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
