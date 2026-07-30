const StatCard = ({ icon: Icon, label, value, tint = 'brand', trend, onClick }) => {
  const tints = {
    brand: 'bg-brand-50 text-brand-600',
    teal: 'bg-teal-500/10 text-teal-600',
    amber: 'bg-amber-400/10 text-amber-500',
    rose: 'bg-rose-500/10 text-rose-500',
  };
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`card p-5 text-left w-full ${onClick ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-card hover:border-brand-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`}>
          <Icon size={18} />
        </div>
        {trend && <span className="text-xs font-medium text-teal-600">{trend}</span>}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Wrapper>
  );
};

export default StatCard;
