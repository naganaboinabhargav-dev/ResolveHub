import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const STAGES = [
  { label: 'Open', color: 'bg-brand-500' },
  { label: 'Assigned', color: 'bg-indigo-400' },
  { label: 'In Progress', color: 'bg-amber-400' },
  { label: 'Resolved', color: 'bg-teal-500' },
];

const FLOWING_TICKETS = [
  { id: 'TKT-2026-0182', tag: 'Bug Report', delay: '0s', top: '10%' },
  { id: 'TKT-2026-0183', tag: 'Billing', delay: '2.4s', top: '42%' },
  { id: 'TKT-2026-0184', tag: 'Feature Req.', delay: '4.8s', top: '74%' },
];

const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-void pb-24 pt-36 lg:pt-44">
    {/* ambient grid + glow */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage:
          'linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
    <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />

    <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 animate-fadeUp">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-teal-400" />
          Live support platform for modern teams
        </div>
        <h1 className="animate-fadeUp font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ animationDelay: '0.05s' }}>
          Every client issue, <span className="text-brand-300">resolved</span> in one clear pipeline
        </h1>
        <p className="mx-auto mt-6 max-w-xl animate-fadeUp text-lg text-white/60" style={{ animationDelay: '0.1s' }}>
          ResolveHub connects clients, agents, and admins around one shared view of every ticket —
          from the first message to the final resolution.
        </p>
        <div className="mt-9 flex animate-fadeUp flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '0.15s' }}>
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            Start for free <FiArrowRight />
          </Link>
          <Link to="/login" className="btn w-full border border-white/15 text-white hover:bg-white/5 sm:w-auto">
            Sign in to your workspace
          </Link>
        </div>
        <div className="mt-6 flex animate-fadeUp flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40" style={{ animationDelay: '0.2s' }}>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-teal-400" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-teal-400" /> Role-based dashboards</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-teal-400" /> Live status tracking</span>
        </div>
      </div>

      {/* Signature visual: live ticket pipeline */}
      <div className="relative mx-auto mt-20 max-w-5xl animate-fadeUp" style={{ animationDelay: '0.25s' }}>
        <div className="rounded-2xl border border-white/10 bg-voidlight/60 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-display text-sm font-medium text-white/70">Ticket Pipeline — Live</p>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
            </div>
          </div>

          <div className="relative grid grid-cols-4 gap-3 overflow-hidden">
            {STAGES.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{s.label}</span>
                </div>
                <div className="h-28 rounded-lg bg-void/40" />
              </div>
            ))}

            {/* animated flowing ticket chips */}
            {FLOWING_TICKETS.map((t) => (
              <div
                key={t.id}
                className="absolute top-0 flex animate-flowRight items-center gap-2 rounded-lg border border-brand-300/30 bg-brand-500/20 px-2.5 py-1.5 text-[11px] font-mono text-brand-100 shadow-glow"
                style={{ animationDelay: t.delay, top: t.top }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                {t.id}
                <span className="text-white/40">· {t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
