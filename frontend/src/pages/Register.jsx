import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to ResolveHub, ${user.name.split(' ')[0]}!`);
      navigate('/client/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start raising and tracking support tickets in minutes"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input required className="input pl-10" placeholder="Jane Cooper" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Company</label>
          <div className="relative">
            <FiBriefcase className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input className="input pl-10" placeholder="Acme Inc." value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input type="email" required className="input pl-10" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input type="password" required minLength={6} className="input pl-10" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create free account'}
        </button>
        <p className="text-center text-xs text-muted">
          By signing up you agree this is a demo project for evaluation purposes.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
