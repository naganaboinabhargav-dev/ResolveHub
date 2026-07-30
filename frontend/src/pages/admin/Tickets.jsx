import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiEye, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const STATUSES = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const AdminTickets = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState(null);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    stage: searchParams.get('stage') || '',
    unassigned: searchParams.get('unassigned') || '',
    search: '',
    page: 1,
  });
  const [meta, setMeta] = useState({ pages: 1, total: 0 });

  const load = async () => {
    const params = { ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    const { data } = await api.get('/tickets', { params });
    setTickets(data.tickets);
    setMeta({ pages: data.pages, total: data.total });
  };

  useEffect(() => { load(); }, [filters.status, filters.priority, filters.stage, filters.unassigned, filters.page]);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [filters.search]);
  useEffect(() => {
    api.get('/users', { params: { role: 'agent' } }).then(({ data }) => setAgents(data.users));
  }, []);

  const activeStageLabel = { open: 'Open pipeline', resolved: 'Resolved', unresolved: 'Unresolved' }[filters.stage];

  const exportCsv = async () => {
    try {
      const params = { ...filters };
      delete params.search;
      delete params.page;
      delete params.stage;
      delete params.unassigned;
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const response = await api.get('/tickets/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to export tickets');
    }
  };

  const assignAgent = async (ticket, agentId) => {
    if (!agentId) return;
    await api.put(`/tickets/${ticket._id}/assign`, { agentId });
    toast.success('Ticket assigned');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">All Tickets</h1>
          <p className="text-sm text-muted">
            {meta.total} tickets across the organization.
            {(activeStageLabel || filters.unassigned) && (
              <>
                {' '}Filtered by: <span className="font-medium text-brand-600">{filters.unassigned ? 'Unassigned' : activeStageLabel}{filters.priority ? ` · ${filters.priority} priority` : ''}</span>
                <button onClick={() => setFilters({ ...filters, status: '', priority: '', stage: '', unassigned: '', page: 1 })} className="ml-2 text-xs font-medium text-muted underline hover:text-ink">
                  clear
                </button>
              </>
            )}
          </p>
        </div>
        <button onClick={exportCsv} className="btn-outline">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-10" placeholder="Search by subject or ticket #" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        </div>
        <select className="input w-40" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-40" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {!tickets ? (
        <Loader />
      ) : tickets.length === 0 ? (
        <EmptyState icon="🎫" title="No tickets match your filters" />
      ) : (
        <>
          <DataTable columns={['Ticket', 'Client', 'Category', 'Priority', 'Status', 'Agent', '']}>
            {tickets.map((t) => (
              <tr key={t._id} className="hover:bg-paper/50">
                <td className="px-5 py-3.5">
                  <p className="font-mono text-xs text-brand-600">{t.ticketNumber}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="max-w-[220px] truncate font-medium text-ink">{t.subject}</p>
                    {t.isEscalated && <FiAlertTriangle className="shrink-0 text-rose-500" size={13} title="SLA breached" />}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted">{t.client?.name}</td>
                <td className="px-5 py-3.5 text-muted">{t.category?.icon} {t.category?.name}</td>
                <td className="px-5 py-3.5"><PriorityBadge priority={t.priority} /></td>
                <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3.5">
                  <select
                    className="rounded-lg border border-line bg-white px-2 py-1 text-xs"
                    value={t.assignedAgent?._id || ''}
                    onChange={(e) => assignAgent(t, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <Link to={`/admin/tickets/${t._id}`} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600">
                    <FiEye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>

          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: meta.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${filters.page === i + 1 ? 'bg-brand-500 text-white' : 'text-muted hover:bg-black/5'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminTickets;
