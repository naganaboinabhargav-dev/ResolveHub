import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiMenu, FiX } from 'react-icons/fi';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#roles', label: 'For Teams' },
  { href: '#faq', label: 'FAQ' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-void/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
            <FiTarget className="text-white" size={18} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-white">ResolveHub</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-white/70 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary !py-2">
            Get started free
          </Link>
        </div>

        <button className="text-white md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-void px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-white/70">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/login" className="btn-outline !bg-transparent !text-white !border-white/20" onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>
                Get started free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
