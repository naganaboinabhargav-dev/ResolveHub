const STEPS = [
  {
    n: '01',
    title: 'Client raises a ticket',
    desc: 'They pick the resource, category, and subcategory — the form adapts automatically with relevant fields.',
  },
  {
    n: '02',
    title: 'Admin triages & assigns',
    desc: 'Incoming tickets land in a shared queue where admins set priority and route them to the right agent.',
  },
  {
    n: '03',
    title: 'Agent resolves the issue',
    desc: 'Agents work the conversation thread, add internal notes, and update status as they make progress.',
  },
  {
    n: '04',
    title: 'Client tracks in real time',
    desc: 'Status changes and replies trigger instant notifications — no more "any update?" emails.',
  },
];

const Workflow = () => (
  <section id="workflow" className="bg-void py-24">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-300">Workflow</span>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          From first report to full resolution
        </h2>
      </div>

      <div className="relative mt-16 grid gap-8 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 md:block" />
        {STEPS.map((s) => (
          <div key={s.n} className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand-300/30 bg-brand-500/20 font-display text-sm font-semibold text-brand-200">
              {s.n}
            </div>
            <h3 className="font-display text-base font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Workflow;
