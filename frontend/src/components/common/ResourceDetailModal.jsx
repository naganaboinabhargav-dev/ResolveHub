import Modal from './Modal';
import WarrantyBadge from './WarrantyBadge';

const TYPE_ICON = { product: '📦', service: '🛎️', project: '📁' };
const STATUS_STYLES = { active: 'bg-teal-500/10 text-teal-600', inactive: 'bg-gray-100 text-gray-500', completed: 'bg-brand-50 text-brand-700' };

const Row = ({ label, value }) =>
  value ? (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  ) : null;

const ResourceDetailModal = ({ resource, onClose, showClient = true }) => {
  if (!resource) return null;
  const { name, type, status, description, meta = {}, client, createdAt, updatedAt } = resource;

  return (
    <Modal isOpen={!!resource} onClose={onClose} title="Resource details" size="md">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper text-2xl">
          {TYPE_ICON[type]}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{name}</h3>
          <span className={`badge mt-1 ${STATUS_STYLES[status]}`}>{status}</span>
        </div>
      </div>

      {description && <p className="mb-4 rounded-xl bg-paper/70 p-3 text-sm text-ink/70">{description}</p>}

      <div className="rounded-xl border border-line px-4">
        <Row label="Type" value={<span className="capitalize">{type}</span>} />
        {showClient && client && <Row label="Client" value={`${client.name}${client.company ? ` (${client.company})` : ''}`} />}
        <Row label="Serial number" value={meta.serialNumber} />
        <Row label="Subscription ID" value={meta.subscriptionId} />
        <Row
          label="Warranty"
          value={meta.warrantyUntil ? <WarrantyBadge warrantyUntil={meta.warrantyUntil} /> : <span className="text-sm text-muted">Not set</span>}
        />
        {meta.moduleList?.length > 0 && <Row label="Modules" value={meta.moduleList.join(', ')} />}
        <Row label="Assigned on" value={new Date(createdAt).toLocaleDateString()} />
        <Row label="Last updated" value={new Date(updatedAt).toLocaleDateString()} />
      </div>
    </Modal>
  );
};

export default ResourceDetailModal;
