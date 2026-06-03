import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';

function formatDate(dateString) {
  return dateString
    ? new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Never';
}

function formatDateTime(dateString) {
  return dateString
    ? new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';
}

function truncate(value, max = 80) {
  if (!value) return '-';
  return value.length <= max ? value : `${value.slice(0, max)}...`;
}

export default function PublicStats() {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .get(`/api/public/stats/${shortCode}`)
      .then((response) => {
        setStats(response.data.analytics);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to load public stats.');
      })
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) {
    return <div className="surface-card p-10 text-center text-slate-500">Loading public metrics...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{error}</div>
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  const { url, metrics, lastVisit, dailyClickCounts } = stats;
  const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();

  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Public stats</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950">{shortCode}</h1>
            <p className="mt-2 text-sm text-slate-600">Anyone with this link can view the public metrics below.</p>
          </div>
          <div className="soft-panel px-4 py-3 text-slate-700">
            <p className="eyebrow">Status</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{isExpired ? 'Expired' : 'Active'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Clicks', metrics.totalClicks],
            ['Created', formatDate(url.createdAt)],
            ['Last visit', lastVisit ? formatDateTime(lastVisit.visitedAt) : 'No visits yet'],
            ['Average / day', metrics.averageClicksPerDay]
          ].map(([label, value]) => (
            <article className="metric-card" key={label}>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 break-words text-2xl font-semibold text-slate-950">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="soft-panel p-6">
            <p className="eyebrow">Short URL</p>
            <a href={url.shortUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-base font-medium text-cyan-700 hover:text-cyan-800">
              {url.shortUrl}
            </a>
          </div>
          <div className="soft-panel p-6">
            <p className="eyebrow">Expiration</p>
            <p className="mt-3 text-sm font-medium text-slate-950">{url.expiresAt ? formatDateTime(url.expiresAt) : 'No expiration'}</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Recent visit details</h2>
            <p className="mt-2 text-sm text-slate-600">Last known visit information for this short link.</p>
          </div>
          <Link to="/" className="btn-secondary">
            Back to home
          </Link>
        </div>

        {lastVisit ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="soft-panel p-6">
              <p className="eyebrow">Referrer</p>
              <p className="mt-3 text-sm font-medium text-slate-950">{truncate(lastVisit.referrer || 'Direct')}</p>
            </div>
            <div className="soft-panel p-6">
              <p className="eyebrow">IP address</p>
              <p className="mt-3 text-sm font-medium text-slate-950">{lastVisit.ipAddress || 'Unknown'}</p>
            </div>
            <div className="soft-panel p-6">
              <p className="eyebrow">User agent</p>
              <p className="mt-3 text-sm font-medium text-slate-950">{truncate(lastVisit.userAgent, 120)}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 soft-panel p-8 text-center text-slate-500">No visit details are available yet.</div>
        )}
      </section>

      <section className="surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Click history</h2>
        <p className="mt-2 text-sm text-slate-600">Daily click count for the last two weeks.</p>

        <div className="mt-6 table-shell">
          <table className="data-table min-w-[420px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {dailyClickCounts.map((item) => (
                <tr key={item.date}>
                  <td>{item.date}</td>
                  <td className="font-semibold text-slate-950">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
