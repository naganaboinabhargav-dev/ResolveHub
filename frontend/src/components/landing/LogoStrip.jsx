const CLIENTS = ['Nimbus Retail', 'Fjord Logistics', 'Kim & Partners', 'Atlas Manufacturing', 'Northwind Labs', 'Cedar & Co'];

const LogoStrip = () => (
  <section className="border-y border-line bg-white py-10">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted">
        Trusted by support teams at
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {CLIENTS.map((c) => (
          <span key={c} className="font-display text-sm font-medium text-ink/30">{c}</span>
        ))}
      </div>
    </div>
  </section>
);

export default LogoStrip;
