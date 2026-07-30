import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import api from '../../api/axios';

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const t = setTimeout(() => {
      api.get('/search', { params: { q } }).then(({ data }) => setResults(data));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const go = (path) => { setOpen(false); setQ(''); setResults(null); navigate(path); };

  const hasResults = results && (results.tickets.length || results.users.length || results.resources.length);

  return (
    <div className="relative w-full max-w-xs" ref={ref}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
      <input
        className="input pl-9 !py-2"
        placeholder="Search tickets, users, resources..."
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQ(e.target.value)}
      />
      {q && (
        <button onClick={() => { setQ(''); setResults(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          <FiX size={14} />
        </button>
      )}

      {open && q.trim() && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-card">
          {!results ? (
            <p className="p-3 text-center text-sm text-muted">Searching...</p>
          ) : !hasResults ? (
            <p className="p-3 text-center text-sm text-muted">No matches for "{q}"</p>
          ) : (
            <>
              {results.tickets.length > 0 && (
                <div className="mb-1.5">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Tickets</p>
                  {results.tickets.map((t) => (
                    <button key={t._id} onClick={() => go(`/admin/tickets/${t._id}`)} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-paper">
                      <span className="font-mono text-xs text-brand-600">{t.ticketNumber}</span> {t.subject}
                    </button>
                  ))}
                </div>
              )}
              {results.users.length > 0 && (
                <div className="mb-1.5">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Users</p>
                  {results.users.map((u) => (
                    <button key={u._id} onClick={() => go(`/admin/users?role=${u.role}`)} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-paper">
                      {u.name} <span className="text-xs text-muted">({u.email})</span>
                    </button>
                  ))}
                </div>
              )}
              {results.resources.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Resources</p>
                  {results.resources.map((r) => (
                    <button key={r._id} onClick={() => go('/admin/resources')} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-paper">
                      {r.name} <span className="text-xs text-muted">({r.client?.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
