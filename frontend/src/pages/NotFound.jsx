import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="surface-card mx-auto max-w-2xl p-10 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950">Page not found</h1>
      <p className="mt-4 text-slate-600">The page you requested is not available in ByteLink.</p>
      <Link className="btn-primary mt-7" to="/">
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
