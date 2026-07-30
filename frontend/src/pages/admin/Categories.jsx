import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const RESOURCE_TYPES = ['product', 'service', 'project'];
const FIELD_TYPES = ['text', 'textarea', 'select', 'date', 'number'];

const emptyForm = {
  name: '', icon: '❓', description: '', subcategoriesText: '', applicableResourceTypes: ['product', 'service', 'project'], dynamicFields: [],
};

const Categories = () => {
  const [categories, setCategories] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/categories');
    setCategories(data.categories);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (cat) => {
    setForm({
      name: cat.name, icon: cat.icon, description: cat.description,
      subcategoriesText: cat.subcategories.join(', '),
      applicableResourceTypes: cat.applicableResourceTypes,
      dynamicFields: cat.dynamicFields,
    });
    setEditingId(cat._id);
    setShowModal(true);
  };

  const addField = () => setForm((f) => ({ ...f, dynamicFields: [...f.dynamicFields, { label: '', name: '', type: 'text', required: false, options: [] }] }));
  const updateField = (i, key, value) => setForm((f) => {
    const fields = [...f.dynamicFields];
    fields[i] = { ...fields[i], [key]: value };
    return { ...f, dynamicFields: fields };
  });
  const removeField = (i) => setForm((f) => ({ ...f, dynamicFields: f.dynamicFields.filter((_, idx) => idx !== i) }));

  const toggleResourceType = (t) => setForm((f) => ({
    ...f,
    applicableResourceTypes: f.applicableResourceTypes.includes(t)
      ? f.applicableResourceTypes.filter((x) => x !== t)
      : [...f.applicableResourceTypes, t],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      icon: form.icon,
      description: form.description,
      subcategories: form.subcategoriesText.split(',').map((s) => s.trim()).filter(Boolean),
      applicableResourceTypes: form.applicableResourceTypes,
      dynamicFields: form.dynamicFields
        .filter((f) => f.label && f.name)
        .map((f) => ({ ...f, options: typeof f.options === 'string' ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : f.options })),
    };
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    await api.delete(`/categories/${confirmTarget._id}`);
    toast.success('Category removed');
    setConfirmTarget(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
          <p className="text-sm text-muted">Define ticket categories, subcategories, and dynamic form fields.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><FiPlus /> New category</button>
      </div>

      {!categories ? (
        <Loader />
      ) : categories.length === 0 ? (
        <EmptyState icon="🏷️" title="No categories yet" subtitle="Create your first ticket category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.icon}</span>
                  <h3 className="font-display font-semibold text-ink">{c.name}</h3>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600"><FiEdit2 size={14} /></button>
                  <button onClick={() => setConfirmTarget(c)} className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-500"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.subcategories.map((s) => (
                  <span key={s} className="badge bg-paper text-ink/70">{s}</span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">{c.dynamicFields.length} custom field{c.dynamicFields.length !== 1 ? 's' : ''} · applies to {c.applicableResourceTypes.join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit category' : 'New category'} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="label">Icon</label>
              <input className="input text-center" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div className="col-span-3">
              <label className="label">Name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Subcategories (comma-separated)</label>
            <input className="input" value={form.subcategoriesText} onChange={(e) => setForm({ ...form, subcategoriesText: e.target.value })} placeholder="Login Issue, Permission Request" />
          </div>
          <div>
            <label className="label">Applies to resource types</label>
            <div className="flex gap-2">
              {RESOURCE_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleResourceType(t)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition ${
                    form.applicableResourceTypes.includes(t) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label !mb-0">Dynamic fields</label>
              <button type="button" onClick={addField} className="text-xs font-semibold text-brand-600 hover:underline">+ Add field</button>
            </div>
            <div className="space-y-2">
              {form.dynamicFields.map((f, i) => (
                <div key={i} className="rounded-xl border border-line p-3">
                  <div className="grid grid-cols-12 gap-2">
                    <input placeholder="Label" className="input col-span-4 !py-1.5 text-xs" value={f.label} onChange={(e) => updateField(i, 'label', e.target.value)} />
                    <input placeholder="field_name" className="input col-span-3 !py-1.5 text-xs" value={f.name} onChange={(e) => updateField(i, 'name', e.target.value)} />
                    <select className="input col-span-2 !py-1.5 text-xs" value={f.type} onChange={(e) => updateField(i, 'type', e.target.value)}>
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="col-span-2 flex items-center gap-1.5 text-xs text-muted">
                      <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, 'required', e.target.checked)} /> Required
                    </label>
                    <button type="button" onClick={() => removeField(i)} className="col-span-1 text-rose-500"><FiTrash2 size={14} /></button>
                  </div>
                  {f.type === 'select' && (
                    <input
                      placeholder="Options (comma-separated)"
                      className="input mt-2 !py-1.5 text-xs"
                      value={Array.isArray(f.options) ? f.options.join(', ') : f.options}
                      onChange={(e) => updateField(i, 'options', e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={doDelete}
        title="Delete category"
        message={`Delete "${confirmTarget?.name}"? Existing tickets keep their history but this category will no longer be selectable.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
};

export default Categories;
