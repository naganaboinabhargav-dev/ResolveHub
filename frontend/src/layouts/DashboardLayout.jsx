import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiTarget, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { navByRole } from '../utils/roleNav';
import NotificationBell from '../components/notifications/NotificationBell';
import Chatbot from '../components/chatbot/Chatbot';
import GlobalSearch from '../components/common/GlobalSearch';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = navByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-void text-white lg:flex">
        <SidebarContent nav={nav} user={user} onLogout={handleLogout} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-void/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-void text-white animate-fadeUp">
            <button
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={18} />
            </button>
            <SidebarContent nav={nav} user={user} onLogout={handleLogout} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-white/80 px-4 backdrop-blur lg:px-8">
          <button className="rounded-lg p-2 text-ink/70 hover:bg-black/5 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </button>
          <div className="hidden text-sm text-muted lg:block">
            Welcome back, <span className="font-medium text-ink">{user.name.split(' ')[0]}</span>
          </div>
          {user.role === 'admin' && (
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
          )}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 sm:flex">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: user.avatarColor || '#5B5FEE' }}
              >
                {user.name.charAt(0)}
              </span>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-ink">{user.name}</p>
                <p className="text-[11px] capitalize text-muted">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

const SidebarContent = ({ nav, user, onLogout, onNavigate }) => (
  <>
    <div className="flex items-center gap-2 px-6 py-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
        <FiTarget className="text-white" size={18} />
      </div>
      <span className="font-display text-lg font-semibold tracking-tight">ResolveHub</span>
    </div>

    <nav className="flex-1 space-y-1 px-3">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-brand-500 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </nav>

    <div className="border-t border-white/10 px-3 py-4">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: user.avatarColor || '#5B5FEE' }}
        >
          {user.name.charAt(0)}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-semibold text-white">{user.name}</p>
          <p className="truncate text-[11px] text-white/50">{user.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
      >
        <FiLogOut size={17} />
        Sign out
      </button>
      <Link
        to="/"
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/40 transition hover:bg-white/5 hover:text-white"
      >
        <FiExternalLink size={17} />
        Back to website
      </Link>
    </div>
  </>
);

export default DashboardLayout;
