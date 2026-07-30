import { FiCheck } from 'react-icons/fi';

const ROLES = [
  {
    name: 'Admins',
    tagline: 'Full control, zero blind spots',
    color: 'border-brand-500/30',
    points: ['Manage users, resources & categories', 'Assign & escalate any ticket', 'Org-wide analytics dashboard'],
  },
  {
    name: 'Agents',
    tagline: 'Focused queues, faster resolutions',
    color: 'border-teal-500/30',
    points: ['See only tickets assigned to you', 'Internal notes for team context', 'Personal performance stats'],
  },
  {
    name: 'Clients',
    tagline: 'Total visibility into every request',
    color: 'border-amber-400/30',
    points: ['Raise tickets in under a minute', 'Track status changes live', 'Chat with the built-in assistant'],
  },
];

const Roles = () => (
  <section id="roles" className="bg-white py-24">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">For every team</span>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          One platform, three tailored experiences
        </h2>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.name} className={`card border-2 ${r.color} p-7`}>
            <h3 className="font-display text-xl font-semibold text-ink">{r.name}</h3>
            <p className="mt-1 text-sm text-muted">{r.tagline}</p>
            <ul className="mt-6 space-y-3">
              {r.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-ink/80">
                  <FiCheck className="mt-0.5 shrink-0 text-teal-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Roles;
