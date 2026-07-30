import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
    <div className="font-display text-6xl font-bold text-brand-500">404</div>
    <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
    <p className="max-w-sm text-sm text-muted">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn-primary mt-2">Back to home</Link>
  </div>
);

export default NotFound;
