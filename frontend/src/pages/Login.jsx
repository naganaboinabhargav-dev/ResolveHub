import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@resolvehub.com' },
  { label: 'Agent', email: 'agent1@resolvehub.com' },
  { label: 'Client', email: 'client1@resolvehub.com' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: email.startsWith('admin') ? 'Admin@123' : email.startsWith('agent') ? 'Agent@123' : 'Client@123' });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your ResolveHub workspace"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create one free
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="email"
              required
              className="input pl-10"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type={showPass ? 'text' : 'password'}
              required
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-line bg-paper p-4">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">Try a demo account</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((d) => (
            <button
              key={d.label}
              onClick={() => fillDemo(d.email)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-brand-500 hover:text-brand-600"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
