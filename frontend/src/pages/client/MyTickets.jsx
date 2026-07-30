import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import CreateTicketWizard from './CreateTicketWizard';

const STATUSES = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];

const MyTickets = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState(null);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    stage: searchParams.get('stage') || '',
    search: '',
  });
  const [showWizard, setShowWizard] = useState(false);

  const load = async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.stage) params.stage = filters.stage;
    if (filters.search) params.search = filters.search;
    const { data } = await api.get('/tickets', { params });
    setTickets(data.tickets);
  };

  useEffect(() => { load(); }, [filters.status, filters.stage]);
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [filters.search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Tickets</h1>
          <p className="text-sm text-muted">Every request you've raised, all in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowWizard(true)}>
          <FiPlus /> New ticket
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-10" placeholder="Search your tickets" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="input w-44" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!tickets ? (
        <Loader />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="No tickets yet"
          subtitle="Raise your first support ticket and our team will get right on it."
          action={<button className="btn-primary" onClick={() => setShowWizard(true)}><FiPlus /> New ticket</button>}
        />
      ) : (
        <DataTable columns={['Ticket', 'Resource', 'Category', 'Priority', 'Status', '']}>
          {tickets.map((t) => (
            <tr key={t._id} className="hover:bg-paper/50">
              <td className="px-5 py-3.5">
                <p className="font-mono text-xs text-brand-600">{t.ticketNumber}</p>
                <p className="max-w-[220px] truncate font-medium text-ink">{t.subject}</p>
              </td>
              <td className="px-5 py-3.5 text-muted">{t.resource?.name}</td>
              <td className="px-5 py-3.5 text-muted">{t.category?.icon} {t.category?.name}</td>
              <td className="px-5 py-3.5"><PriorityBadge priority={t.priority} /></td>
              <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
              <td className="px-5 py-3.5">
                <Link to={`/client/tickets/${t._id}`} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600">
                  <FiEye size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {showWizard && (
        <CreateTicketWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); load(); }}
        />
      )}
    </div>
  );
};

export default MyTickets;
