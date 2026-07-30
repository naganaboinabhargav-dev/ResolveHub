import { useEffect, useState } from 'react';
import { FiPlus, FiBox, FiSearch, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import WarrantyBadge from '../../components/common/WarrantyBadge';
import ResourceDetailModal from '../../components/common/ResourceDetailModal';

const emptyForm = { name: '', type: 'product', client: '', description: '', warrantyUntil: '' };
const TYPE_ICON = { product: '📦', service: '🛎️', project: '📁' };

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const Resources = () => {
  const [resources, setResources] = useState(null);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [filters, setFilters] = useState({ search: '', type: '', status: '', client: '' });

  const load = async () => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.client) params.client = filters.client;
    const { data } = await api.get('/resources', { params });
    setResources(data.resources);
  };

  useEffect(() => { load(); }, [filters.type, filters.status, filters.client]);
  useEffect(() => {
    load();
    api.get('/users', { params: { role: 'client' } }).then(({ data }) => setClients(data.users));
  }, []);

  const filtered = (resources || []).filter((r) => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.client?.name?.toLowerCase().includes(q) || r.client?.company?.toLowerCase().includes(q);
  });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { warrantyUntil, ...rest } = form;
      const payload = { ...rest, meta: warrantyUntil ? { warrantyUntil } : undefined };
      await api.post('/resources', payload);
      toast.success('Resource assigned');
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (resource, status) => {
    await api.put(`/resources/${resource._id}`, { status });
    toast.success('Resource updated');
    load();
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setEditForm({
      name: r.name,
      description: r.description || '',
      status: r.status,
      serialNumber: r.meta?.serialNumber || '',
      subscriptionId: r.meta?.subscriptionId || '',
      warrantyUntil: toDateInput(r.meta?.warrantyUntil),
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await api.put(`/resources/${editTarget._id}`, {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        meta: {
          serialNumber: editForm.serialNumber,
          subscriptionId: editForm.subscriptionId,
          warrantyUntil: editForm.warrantyUntil || null,
        },
      });
      toast.success('Resource updated');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update resource');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Resources</h1>
          <p className="text-sm text-muted">Products, services, and projects assigned to clients. Click a row for full details.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Assign resource
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-10" placeholder="Search by name or client" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="input w-36" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
          <option value="project">Project</option>
        </select>
        <select className="input w-40" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
        <select className="input w-48" value={filters.client} onChange={(e) => setFilters({ ...filters, client: e.target.value })}>
          <option value="">All clients</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {!resources ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No resources match your filters" subtitle="Try adjusting your search or filters, or assign a new resource." />
      ) : (
        <DataTable columns={['Resource', 'Type', 'Client', 'Warranty', 'Status', 'Created', '']}>
          {filtered.map((r) => (
            <tr key={r._id} className="cursor-pointer hover:bg-paper/50" onClick={() => setViewTarget(r)}>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 font-medium text-ink">
                  <span>{TYPE_ICON[r.type]}</span> {r.name}
                </div>
              </td>
              <td className="px-5 py-3.5 capitalize text-muted">{r.type}</td>
              <td className="px-5 py-3.5 text-muted">{r.client?.name} <span className="text-xs">({r.client?.company})</span></td>
              <td className="px-5 py-3.5"><WarrantyBadge warrantyUntil={r.meta?.warrantyUntil} /></td>
              <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r, e.target.value)}
                  className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td className="px-5 py-3.5 text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600" title="Edit">
                  <FiEdit2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ResourceDetailModal resource={viewTarget} onClose={() => setViewTarget(null)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign a resource">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Resource name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cloud Analytics Suite" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div>
              <label className="label">Client</label>
              <select required className="input" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.company || 'No company'}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Warranty until (optional)</label>
            <input type="date" className="input" value={form.warrantyUntil} onChange={(e) => setForm({ ...form, warrantyUntil: e.target.value })} />
            <p className="mt-1 text-xs text-muted">Clients can't raise new tickets for this resource once its warranty has expired.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            <FiBox /> {saving ? 'Assigning...' : 'Assign resource'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit resource">
        {editTarget && editForm && (
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="rounded-xl bg-paper/70 p-3.5 text-sm text-muted">
              {TYPE_ICON[editTarget.type]} <span className="capitalize">{editTarget.type}</span> · assigned to {editTarget.client?.name}
            </div>
            <div>
              <label className="label">Resource name</label>
              <input required className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={3} className="input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="label">Warranty until</label>
                <input type="date" className="input" value={editForm.warrantyUntil} onChange={(e) => setEditForm({ ...editForm, warrantyUntil: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Serial number</label>
                <input className="input" value={editForm.serialNumber} onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })} />
              </div>
              <div>
                <label className="label">Subscription ID</label>
                <input className="input" value={editForm.subscriptionId} onChange={(e) => setEditForm({ ...editForm, subscriptionId: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={editSaving} className="btn-primary w-full">{editSaving ? 'Saving...' : 'Save changes'}</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Resources;
