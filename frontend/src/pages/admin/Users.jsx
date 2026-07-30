import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiMessageSquare, FiEdit2 } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const emptyForm = { name: '', email: '', password: '', role: 'client', company: '', phone: '', plan: 'basic' };

const Users = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState(null);
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    const params = {};
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    const { data } = await api.get('/users', { params });
    // Admin accounts are managed outside this panel entirely
    setUsers(data.users.filter((u) => u.role !== 'admin'));
  };

  useEffect(() => { load(); }, [roleFilter]);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('User created');
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}/status`);
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/users/${confirmTarget._id}`);
      toast.success('User removed');
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
      setConfirmTarget(null);
    }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ name: u.name, phone: u.phone || '', company: u.company || '', plan: u.plan || 'basic' });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await api.put(`/users/${editTarget._id}`, editForm);
      toast.success('User details updated');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
          <p className="text-sm text-muted">Manage agent and client accounts. Admin accounts aren't managed here.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New user
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input className="input pl-10" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="agent">Agent</option>
          <option value="client">Client</option>
        </select>
      </div>

      {!users ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState icon="👤" title="No users found" subtitle="Try adjusting your filters or add a new user." />
      ) : (
        <DataTable columns={['Name', 'Email', 'Role', 'Plan', 'Joined', 'Status', 'Actions']}>
          {users.map((u) => (
            <tr key={u._id} className="cursor-pointer hover:bg-paper/50" onClick={() => openEdit(u)}>
              <td className="px-5 py-3.5 font-medium text-ink">{u.name}</td>
              <td className="px-5 py-3.5 text-muted">{u.email}</td>
              <td className="px-5 py-3.5"><span className="badge bg-brand-50 text-brand-700 capitalize">{u.role}</span></td>
              <td className="px-5 py-3.5 capitalize text-muted">{u.plan}</td>
              <td className="px-5 py-3.5 text-muted">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
              <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleStatus(u)} className={`flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-teal-600' : 'text-muted'}`}>
                  {u.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                  {u.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600" title="View / edit">
                    <FiEdit2 size={15} />
                  </button>
                  <Link to={`/admin/messages/${u._id}`} className="rounded-lg p-1.5 text-muted hover:bg-brand-50 hover:text-brand-600" title="Message">
                    <FiMessageSquare size={15} />
                  </Link>
                  <button onClick={() => setConfirmTarget(u)} className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-500" title="Delete">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create new user">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Temporary password</label>
            <input type="text" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="mt-1 text-xs text-muted">The user can change this themselves from their Profile page after logging in.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="client">Client</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            {form.role === 'client' && (
              <div>
                <label className="label">Plan</label>
                <select className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="label">Company (optional)</label>
            <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Creating...' : 'Create user'}</button>
        </form>
      </Modal>

      {/* View / edit user details */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="User details">
        {editTarget && editForm && (
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-paper/70 p-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {editTarget.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{editTarget.email}</p>
                <p className="text-xs capitalize text-muted">
                  {editTarget.role} · Joined {format(new Date(editTarget.createdAt), 'MMM d, yyyy')}
                  {editTarget.lastLogin && ` · Last login ${format(new Date(editTarget.lastLogin), 'MMM d, yyyy h:mm a')}`}
                </p>
              </div>
            </div>

            <div>
              <label className="label">Full name</label>
              <input required className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
              </div>
            </div>
            {editTarget.role === 'client' && (
              <div>
                <label className="label">Plan</label>
                <select className="input" value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            )}
            <p className="text-xs text-muted">Passwords can only be changed by the account owner from their own Profile page.</p>
            <button type="submit" disabled={editSaving} className="btn-primary w-full">{editSaving ? 'Saving...' : 'Save changes'}</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={doDelete}
        title="Delete user"
        message={`This will permanently remove ${confirmTarget?.name}. This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
};

export default Users;
