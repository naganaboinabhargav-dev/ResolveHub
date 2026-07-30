import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLifeBuoy, FiCheckCircle, FiAlertTriangle, FiUsers, FiBox, FiUserCheck, FiStar } from 'react-icons/fi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import AnnouncementBanner from '../../components/common/AnnouncementBanner';
import StarRating from '../../components/common/StarRating';
import DataTable from '../../components/common/DataTable';

const STATUS_COLORS = { Open: '#5B5FEE', Assigned: '#818CF8', 'In Progress': '#FFB020', Pending: '#FB923C', Resolved: '#17B897', Closed: '#9CA3AF' };

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analytics/dashboard').then(({ data }) => setData(data));
  }, []);

  if (!data) return <Loader label="Loading analytics..." />;

  const { totals, byStatus, byPriority, byCategory, monthlyTrend, csat } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="text-sm text-muted">Organization-wide view of tickets, teams, and resources. Click any card to drill in.</p>
      </div>

      <AnnouncementBanner />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FiLifeBuoy} label="Total tickets" value={totals.all} tint="brand" onClick={() => navigate('/admin/tickets')} />
        <StatCard icon={FiAlertTriangle} label="Open pipeline" value={totals.open} tint="amber" onClick={() => navigate('/admin/tickets?stage=open')} />
        <StatCard icon={FiCheckCircle} label="Resolved" value={totals.resolved} tint="teal" onClick={() => navigate('/admin/tickets?stage=resolved')} />
        <StatCard icon={FiAlertTriangle} label="Critical unresolved" value={totals.critical} tint="rose" onClick={() => navigate('/admin/tickets?stage=unresolved&priority=Critical')} />
        <StatCard icon={FiUsers} label="Total clients" value={totals.totalClients} tint="brand" onClick={() => navigate('/admin/users?role=client')} />
        <StatCard icon={FiUserCheck} label="Total agents" value={totals.totalAgents} tint="teal" onClick={() => navigate('/admin/users?role=agent')} />
        <StatCard icon={FiBox} label="Resources tracked" value={totals.totalResources} tint="amber" onClick={() => navigate('/admin/resources')} />
        <StatCard icon={FiLifeBuoy} label="Unassigned tickets" value={totals.unassigned} tint="rose" onClick={() => navigate('/admin/tickets?stage=unresolved&unassigned=true')} />
        <StatCard icon={FiAlertTriangle} label="Escalated (SLA breach)" value={totals.escalated} tint="rose" onClick={() => navigate('/admin/tickets?stage=unresolved')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Ticket volume trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B5FEE" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#5B5FEE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#17B897" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#17B897" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EF" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
              <Legend />
              <Area type="monotone" dataKey="created" stroke="#5B5FEE" fill="url(#created)" name="Created" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="#17B897" fill="url(#resolved)" name="Resolved" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Tickets by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {byStatus.map((s) => (
                  <Cell key={s.status} fill={STATUS_COLORS[s.status] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Tickets by priority</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EF" vertical={false} />
              <XAxis dataKey="priority" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
              <Bar dataKey="count" fill="#5B5FEE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Top categories</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EF" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E7EF', fontSize: 13 }} />
              <Bar dataKey="count" fill="#17B897" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Customer satisfaction</h3>
          {csat.count === 0 ? (
            <p className="text-sm text-muted">No ratings submitted yet.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <p className="font-display text-3xl font-semibold text-ink">{csat.average}</p>
                <StarRating value={Math.round(csat.average)} size={18} />
              </div>
              <p className="mt-1 text-xs text-muted">Based on {csat.count} rating{csat.count === 1 ? '' : 's'}</p>
            </>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink">Agent leaderboard</h3>
          {!totals.agentLeaderboard || totals.agentLeaderboard.length === 0 ? (
            <p className="text-sm text-muted">No tickets assigned to agents yet.</p>
          ) : (
            <div className="-mx-6 -mb-6 overflow-hidden">
              <DataTable columns={['Agent', 'Resolved', 'Assigned', 'Avg. rating']}>
                {totals.agentLeaderboard.slice(0, 5).map((a) => (
                  <tr key={a._id} className="hover:bg-paper/50">
                    <td className="px-6 py-3 font-medium text-ink">{a.name}</td>
                    <td className="px-6 py-3 text-muted">{a.resolvedCount}</td>
                    <td className="px-6 py-3 text-muted">{a.totalAssigned}</td>
                    <td className="px-6 py-3">
                      {a.ratingCount > 0 ? (
                        <span className="flex items-center gap-1.5"><FiStar className="fill-amber-400 text-amber-400" size={13} /> {a.avgRating} <span className="text-xs text-muted">({a.ratingCount})</span></span>
                      ) : <span className="text-xs text-muted">No ratings yet</span>}
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
