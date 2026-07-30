import { Link } from 'react-router-dom';
import { FiTarget, FiArrowLeft } from 'react-icons/fi';

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen">
    {/* Left brand panel */}
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-void p-12 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[110px]" />

      <Link to="/" className="relative flex items-center gap-2 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
          <FiTarget className="text-white" size={18} />
        </div>
        <span className="font-display text-lg font-semibold text-white">ResolveHub</span>
      </Link>

      <div className="relative">
        <p className="font-display text-3xl font-semibold leading-tight text-white">
          "Every ticket, tracked. Every client, informed."
        </p>
        <p className="mt-4 max-w-sm text-sm text-white/50">
          Join the teams using ResolveHub to turn scattered support requests into one transparent pipeline.
        </p>
      </div>

      <p className="relative text-xs text-white/30">© {new Date().getFullYear()} ResolveHub</p>
    </div>

    {/* Right form panel */}
    <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <FiTarget className="text-white" size={16} />
            </div>
            <span className="font-display text-base font-semibold text-ink">ResolveHub</span>
          </Link>
          <Link to="/" className="ml-auto flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <FiArrowLeft size={14} /> Back to home
          </Link>
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  </div>
);

export default AuthLayout;
