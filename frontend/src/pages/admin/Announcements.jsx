import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiRadio, FiEdit2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const emptyForm = { title: '', message: '', audience: 'all', priority: 'Medium', startDate: '', endDate: '', pinned: false };

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const Announcements = () => {
  const [announcements, setAnnouncements] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/announcements/all');
    setAnnouncements(data.announcements);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (a) => {
    setForm({
      title: a.title, message: a.message, audience: a.audience, priority: a.priority,
      startDate: toDateInput(a.startDate), endDate: toDateInput(a.endDate), pinned: a.pinned,
    });
    setEditingId(a._id);
    setShowModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, form);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement published');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    await api.delete(`/announcements/${confirmTarget._id}`);
    toast.success('Announcement removed');
    setConfirmTarget(null);
    load();
  };

  const isActive = (a) => {
    const now = new Date();
    return new Date(a.startDate) <= now && (!a.endDate || new Date(a.endDate) >= now);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Announcements</h1>
          <p className="text-sm text-muted">Broadcast updates to clients, agents, admins, or everyone.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><FiPlus /> New announcement</button>
      </div>

      {!announcements ? (
        <Loader />
      ) : announcements.length === 0 ? (
        <EmptyState icon="📢" title="No announcements yet" subtitle="Publish your first announcement to keep everyone in the loop." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a._id} className="card flex items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FiRadio className={isActive(a) ? 'text-teal-500' : 'text-muted'} size={15} />
                  <h3 className="font-display font-semibold text-ink">{a.title}</h3>
                  {a.pinned && <span className="badge bg-amber-400/10 text-amber-600">Pinned</span>}
                  <span className={`badge ${isActive(a) ? 'bg-teal-500/10 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>{isActive(a) ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="mt-1 text-sm text-ink/70">{a.message}</p>
                <p className="mt-2 text-xs text-muted">
                  Audience: <span className="capitalize">{a.audience}</span> · Priority: {a.priority} · From {format(new Date(a.startDate), 'MMM d, yyyy')}
                  {a.endDate && ` to ${format(new Date(a.endDate), 'MMM d, yyyy')}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600"><FiEdit2 size={15} /></button>
                <button onClick={() => setConfirmTarget(a)} className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-500"><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit announcement' : 'New announcement'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required rows={3} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Audience</label>
              <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="clients">Clients only</option>
                <option value="agents">Agents only</option>
                <option value="admins">Admins only</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start date</label>
              <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End date (optional)</label>
              <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            Pin to top of banner list
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : editingId ? 'Save changes' : 'Publish announcement'}</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={doDelete}
        title="Delete announcement"
        message={`Remove "${confirmTarget?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
};

export default Announcements;
