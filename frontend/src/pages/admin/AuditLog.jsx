import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const AuditLogPage = () => {
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    api.get('/audit', { params: { page } }).then(({ data }) => {
      setLogs(data.logs);
      setPages(data.pages);
    });
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Audit Log</h1>
        <p className="text-sm text-muted">A record of significant admin actions across the system.</p>
      </div>

      {!logs ? (
        <Loader />
      ) : logs.length === 0 ? (
        <EmptyState icon="🧾" title="No activity recorded yet" />
      ) : (
        <>
          <DataTable columns={['Action', 'Entity', 'Actor', 'Detail', 'When']}>
            {logs.map((l) => (
              <tr key={l._id} className="hover:bg-paper/50">
                <td className="px-5 py-3.5 font-medium text-ink">{l.action}</td>
                <td className="px-5 py-3.5"><span className="badge bg-brand-50 text-brand-700">{l.entityType}</span></td>
                <td className="px-5 py-3.5 text-muted">{l.actorName}</td>
                <td className="px-5 py-3.5 text-muted">{l.detail}</td>
                <td className="px-5 py-3.5 text-muted">{format(new Date(l.createdAt), 'MMM d, yyyy · h:mm a')}</td>
              </tr>
            ))}
          </DataTable>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-brand-500 text-white' : 'text-muted hover:bg-black/5'}`}
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

export default AuditLogPage;
