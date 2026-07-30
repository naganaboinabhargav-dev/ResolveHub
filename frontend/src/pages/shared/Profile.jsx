import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiLock } from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateUserLocal } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', company: user.company || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUserLocal(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
        <p className="text-sm text-muted">Manage your account details and security.</p>
      </div>

      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <FiUser className="text-brand-500" />
          <h2 className="font-display text-sm font-semibold text-ink">Personal information</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-paper" value={user.email} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
      </div>

      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <FiLock className="text-brand-500" />
          <h2 className="font-display text-sm font-semibold text-ink">Change password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input type="password" required className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" required minLength={6} className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary">{changingPw ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
