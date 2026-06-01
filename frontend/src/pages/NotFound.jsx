import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h2 className="text-4xl font-semibold text-slate-900">Looks like you took a wrong turn</h2>
      <p className="mt-4 text-slate-600">This page hasn't been built yet, but the rest of the app is ready to grow.</p>
      <Link className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" to="/">
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
