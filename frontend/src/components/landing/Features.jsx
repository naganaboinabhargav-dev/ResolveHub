import { FiLayers, FiUsers, FiBarChart2, FiMessageSquare, FiBell, FiShield } from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiLayers,
    title: 'Dynamic ticket forms',
    desc: 'Every category ships its own smart fields — bug reports ask for reproduction steps, billing issues ask for invoice numbers.',
    color: 'text-brand-500 bg-brand-50',
  },
  {
    icon: FiUsers,
    title: 'Role-based workspaces',
    desc: 'Purpose-built dashboards for admins, agents, and clients so everyone sees exactly what they need — nothing more.',
    color: 'text-teal-600 bg-teal-500/10',
  },
  {
    icon: FiBarChart2,
    title: 'Live analytics',
    desc: 'Track resolution trends, category breakdowns, and workload distribution with real-time charts.',
    color: 'text-amber-500 bg-amber-400/10',
  },
  {
    icon: FiMessageSquare,
    title: 'Threaded conversations',
    desc: 'Every ticket keeps a full conversation history, with internal notes visible only to your team.',
    color: 'text-brand-500 bg-brand-50',
  },
  {
    icon: FiBell,
    title: 'Instant notifications',
    desc: 'Assignments, replies, and status changes reach the right person the moment they happen.',
    color: 'text-rose-500 bg-rose-500/10',
  },
  {
    icon: FiShield,
    title: 'Secure by design',
    desc: 'JWT-based auth, hashed credentials, and strict role permissions guard every request.',
    color: 'text-teal-600 bg-teal-500/10',
  },
];

const Features = () => (
  <section id="features" className="bg-paper py-24">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">Platform</span>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Everything a support team needs, nothing it doesn't
        </h2>
        <p className="mt-4 text-muted">
          ResolveHub replaces scattered emails and spreadsheets with one structured, transparent workflow.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-card">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
