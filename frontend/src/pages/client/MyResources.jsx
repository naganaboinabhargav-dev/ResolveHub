import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import WarrantyBadge from '../../components/common/WarrantyBadge';
import ResourceDetailModal from '../../components/common/ResourceDetailModal';

const TYPE_ICON = { product: '📦', service: '🛎️', project: '📁' };
const STATUS_STYLES = { active: 'bg-teal-500/10 text-teal-600', inactive: 'bg-gray-100 text-gray-500', completed: 'bg-brand-50 text-brand-700' };

const MyResources = () => {
  const [resources, setResources] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  useEffect(() => { api.get('/resources').then(({ data }) => setResources(data.resources)); }, []);

  if (!resources) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Resources</h1>
        <p className="text-sm text-muted">Products, services, and projects associated with your account. Click one for full details.</p>
      </div>

      {resources.length === 0 ? (
        <EmptyState icon="📦" title="No resources assigned yet" subtitle="Your account manager will assign resources here as they're set up." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <button
              key={r._id}
              onClick={() => setViewTarget(r)}
              className="card p-5 text-left transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper text-xl">
                  {TYPE_ICON[r.type]}
                </div>
                <span className={`badge ${STATUS_STYLES[r.status]}`}>{r.status}</span>
              </div>
              <h3 className="mt-3 font-display font-semibold text-ink">{r.name}</h3>
              <p className="mt-1 text-sm capitalize text-muted">{r.type}</p>
              {r.meta?.warrantyUntil && (
                <div className="mt-2"><WarrantyBadge warrantyUntil={r.meta.warrantyUntil} /></div>
              )}
              {r.description && <p className="mt-2 line-clamp-2 text-sm text-ink/70">{r.description}</p>}
            </button>
          ))}
        </div>
      )}

      <ResourceDetailModal resource={viewTarget} onClose={() => setViewTarget(null)} showClient={false} />
    </div>
  );
};

export default MyResources;
