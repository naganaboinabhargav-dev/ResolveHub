import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
    <div className="text-5xl">🚫</div>
    <h1 className="font-display text-2xl font-semibold text-ink">Access denied</h1>
    <p className="max-w-sm text-sm text-muted">You don't have permission to view this page with your current role.</p>
    <Link to="/" className="btn-primary mt-2">Back to home</Link>
  </div>
);

export default Unauthorized;
