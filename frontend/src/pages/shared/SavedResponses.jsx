import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiClipboard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const SavedResponses = () => {
  const { user } = useAuth();
  const [responses, setResponses] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', scope: 'personal' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/saved-responses');
    setResponses(data.responses);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/saved-responses', form);
      toast.success('Saved response created');
      setShowModal(false);
      setForm({ title: '', body: '', scope: 'personal' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create saved response');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/saved-responses/${id}`);
      toast.success('Removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Saved Responses</h1>
          <p className="text-sm text-muted">Reusable reply templates you can insert while replying to a ticket.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><FiPlus /> New response</button>
      </div>

      {!responses ? (
        <Loader />
      ) : responses.length === 0 ? (
        <EmptyState icon="📋" title="No saved responses yet" subtitle="Create templates for the questions you answer most often." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {responses.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FiClipboard className="text-brand-500" size={16} />
                  <h3 className="font-display font-semibold text-ink">{r.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${r.scope === 'global' ? 'bg-brand-50 text-brand-700' : 'bg-paper text-muted'}`}>{r.scope}</span>
                  {String(r.createdBy) === String(user._id) && (
                    <button onClick={() => remove(r._id)} className="rounded-lg p-1 text-muted hover:bg-rose-50 hover:text-rose-500">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink/70">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New saved response">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Password reset instructions" />
          </div>
          <div>
            <label className="label">Response text</label>
            <textarea required rows={4} className="input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          {user.role === 'admin' && (
            <div>
              <label className="label">Visibility</label>
              <select className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
                <option value="personal">Only me</option>
                <option value="global">All agents &amp; admins</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save response'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default SavedResponses;
