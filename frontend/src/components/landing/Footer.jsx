import { FiTarget } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-void border-t border-white/10 py-10">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
          <FiTarget className="text-white" size={14} />
        </div>
        <span className="font-display text-sm font-semibold text-white">ResolveHub</span>
      </div>
      <p className="text-xs text-white/40">© {new Date().getFullYear()} ResolveHub. Built as a full-stack demo project.</p>
    </div>
  </footer>
);

export default Footer;
