import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CTA = () => (
  <section className="relative overflow-hidden bg-void py-24">
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/25 blur-[120px]" />
    <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Bring order to your support workflow today
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-white/60">
        Set up in minutes. Invite your team, assign resources to clients, and start resolving tickets the same day.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/register" className="btn-primary w-full sm:w-auto">
          Create your free account <FiArrowRight />
        </Link>
        <Link to="/login" className="btn w-full border border-white/15 text-white hover:bg-white/5 sm:w-auto">
          Sign in
        </Link>
      </div>
    </div>
  </section>
);

export default CTA;
