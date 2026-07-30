import { useEffect, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import WarrantyBadge from '../../components/common/WarrantyBadge';

const STEPS = ['Resource', 'Category', 'Details', 'Review'];
const TYPE_ICON = { product: '📦', service: '🛎️', project: '📁' };
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const isWarrantyExpired = (resource) =>
  !!resource?.meta?.warrantyUntil && new Date(resource.meta.warrantyUntil) < new Date();

const CreateTicketWizard = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(0);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    resource: '', category: '', subcategory: '', subject: '', description: '',
    priority: 'Medium', dynamicData: {},
  });

  useEffect(() => {
    api.get('/resources').then(({ data }) => setResources(data.resources));
  }, []);

  const selectedResource = resources.find((r) => r._id === form.resource);
  const selectedCategory = categories.find((c) => c._id === form.category);

  useEffect(() => {
    if (!selectedResource) return;
    api.get('/categories', { params: { activeOnly: 'true', resourceType: selectedResource.type } })
      .then(({ data }) => setCategories(data.categories));
  }, [form.resource]);

  const canProceed = () => {
    if (step === 0) return !!form.resource && !isWarrantyExpired(selectedResource);
    if (step === 1) return !!form.category && !!form.subcategory;
    if (step === 2) {
      if (!form.subject || !form.description) return false;
      const required = selectedCategory?.dynamicFields?.filter((f) => f.required) || [];
      return required.every((f) => form.dynamicData[f.name]);
    }
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const updateDynamic = (name, value) => setForm((f) => ({ ...f, dynamicData: { ...f.dynamicData, [name]: value } }));

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/tickets', form);
      toast.success('Ticket created successfully!');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Raise a new ticket" size="lg">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-paper text-muted'
            }`}>
              {i < step ? <FiCheck size={13} /> : i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:block ${i === step ? 'text-ink' : 'text-muted'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-teal-500' : 'bg-line'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Resource */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted">Which product, service, or project is this about?</p>
          {resources.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
              No resources are assigned to your account yet. Contact your admin.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {resources.map((r) => {
                const expired = isWarrantyExpired(r);
                return (
                  <button
                    key={r._id}
                    onClick={() => {
                      if (expired) {
                        toast.error(
                          `The warranty for "${r.name}" expired on ${new Date(r.meta.warrantyUntil).toLocaleDateString()}. Contact your account manager to renew coverage before raising new tickets.`
                        );
                        return;
                      }
                      setForm({ ...form, resource: r._id, category: '', subcategory: '' });
                    }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition ${
                      expired
                        ? 'border-rose-200 bg-rose-50/40 opacity-80'
                        : form.resource === r._id ? 'border-brand-500 bg-brand-50' : 'border-line hover:border-brand-300'
                    }`}
                  >
                    <span className="text-xl">{expired ? <FiAlertTriangle className="text-rose-500" /> : TYPE_ICON[r.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                      <p className="text-xs capitalize text-muted">{r.type}</p>
                      {r.meta?.warrantyUntil && <div className="mt-1"><WarrantyBadge warrantyUntil={r.meta.warrantyUntil} /></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Category & subcategory */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted">What kind of issue is this?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setForm({ ...form, category: c._id, subcategory: '', dynamicData: {} })}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition ${
                    form.category === c._id ? 'border-brand-500 bg-brand-50' : 'border-line hover:border-brand-300'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                    <p className="truncate text-xs text-muted">{c.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div>
              <p className="mb-2 text-sm text-muted">Pick a more specific subcategory</p>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.subcategories.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, subcategory: s })}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      form.subcategory === s ? 'border-brand-500 bg-brand-500 text-white' : 'border-line text-ink/70 hover:border-brand-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details (dynamic fields) */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Short summary of the issue" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what's happening in detail..." />
          </div>
          <div>
            <label className="label">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    form.priority === p ? 'border-brand-500 bg-brand-500 text-white' : 'border-line text-ink/70'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {selectedCategory?.dynamicFields?.length > 0 && (
            <div className="space-y-3 rounded-xl border border-line bg-paper/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Additional details for {selectedCategory.name}</p>
              {selectedCategory.dynamicFields.map((f) => (
                <div key={f.name}>
                  <label className="label">{f.label}{f.required && <span className="text-rose-500"> *</span>}</label>
                  {f.type === 'textarea' ? (
                    <textarea rows={2} className="input" value={form.dynamicData[f.name] || ''} onChange={(e) => updateDynamic(f.name, e.target.value)} />
                  ) : f.type === 'select' ? (
                    <select className="input" value={form.dynamicData[f.name] || ''} onChange={(e) => updateDynamic(f.name, e.target.value)}>
                      <option value="">Select...</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} className="input" value={form.dynamicData[f.name] || ''} onChange={(e) => updateDynamic(f.name, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Resource</p>
            <p className="font-medium text-ink">{selectedResource?.name}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Category</p>
            <p className="font-medium text-ink">{selectedCategory?.icon} {selectedCategory?.name} / {form.subcategory}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Subject</p>
            <p className="font-medium text-ink">{form.subject}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-ink/70">{form.description}</p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Priority</p>
            <p className="font-medium text-ink">{form.priority}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
        <button onClick={step === 0 ? onClose : back} className="btn-outline">
          <FiArrowLeft /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canProceed()} className="btn-primary">
            Next <FiArrowRight />
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit ticket'} <FiCheck />
          </button>
        )}
      </div>
    </Modal>
  );
};

export default CreateTicketWizard;
