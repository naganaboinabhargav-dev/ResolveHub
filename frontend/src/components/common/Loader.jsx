const Loader = ({ label = 'Loading...' }) => (
  <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 py-12 text-muted">
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-2 border-line" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-500" />
    </div>
    <p className="text-sm">{label}</p>
  </div>
);

export default Loader;
