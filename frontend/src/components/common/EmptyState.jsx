const EmptyState = ({ icon = '📭', title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
    <div className="text-4xl">{icon}</div>
    <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
    {subtitle && <p className="max-w-sm text-sm text-muted">{subtitle}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export default EmptyState;
