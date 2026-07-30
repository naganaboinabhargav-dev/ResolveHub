import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLifeBuoy, FiCheckCircle, FiAlertTriangle, FiClock, FiStar } from 'react-icons/fi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import AnnouncementBanner from '../../components/common/AnnouncementBanner';
import StarRating from '../../components/common/StarRating';

const STATUS_COLORS = { Open: '#5B5FEE', Assigned: '#818CF8', 'In Progress': '#FFB020', Pending: '#FB923C', Resolved: '#17B897', Closed: '#9CA3AF' };

const AgentDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api.get('/analytics/dashboard').then(({ data }) => setData(data)); }, []);
  if (!data) return <Loader label="Loading your dashboard..." />;

  const { totals, byStatus, byPriority, myRating } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Dashboard</h1>
        <p className="text-sm text-muted">Your assigned ticket workload at a glance. Click a card to drill in.</p>
      </div>

      <AnnouncementBanner />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FiLifeBuoy} label="Assigned to me" value={totals.all} tint="brand" onClick={() => navigate('/agent/tickets')} />
        <StatCard icon={FiClock} label="Open pipeline" value={totals.open} tint="amber" onClick={() => navigate('/agent/tickets?stage=open')} />
        <StatCard icon={FiCheckCircle} label="Resolved" value={totals.resolved} tint="teal" onClick={() => navigate('/agent/tickets?stage=resolved')} />
        <StatCard icon={FiAlertTriangle} label="Critical" value={totals.critical} tint="rose" onClick={() => navigate('/agent/tickets?stage=unresolved&priority=Critical')} />
      </div>

      <div className="card p-6">
        <h3 className="mb-3 font-display text-sm font-semibold text-ink">My customer satisfaction rating</h3>
        {!myRating || myRating.count === 0 ? (
          <p className="text-sm text-muted">No ratings from clients yet.</p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="font-display text-3xl font-semibold text-ink">{myRating.average}</p>
            <StarRating value={Math.round(myRating.average)} size={18} />
            <span className="text-xs text-muted">({myRating.count} rating{myRating.count === 1 ? '' : 's'})</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">My tickets by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {byStatus.map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#9CA3AF'} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">By priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EF" vertical={false} />
              <XAxis dataKey="priority" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
              <Bar dataKey="count" fill="#5B5FEE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
