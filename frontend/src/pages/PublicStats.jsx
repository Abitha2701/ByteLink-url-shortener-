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
  return value.length <= max ? value : `${value.slice(0, max)}…`;
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
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        Loading public metrics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          {error}
        </div>
        <Link
          to="/"
          className="inline-flex rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const { url, metrics, lastVisit, dailyClickCounts } = stats;
  const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Public stats for {shortCode}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Anyone with this link can view the public metrics below.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{isExpired ? 'Expired' : 'Active'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Clicks</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.totalClicks}</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Created</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{formatDate(url.createdAt)}</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Last visit</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {lastVisit ? formatDateTime(lastVisit.visitedAt) : 'No visits yet'}
            </p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Average / day</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{metrics.averageClicksPerDay}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Short URL</p>
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block break-all text-base font-medium text-slate-900 hover:text-slate-700"
            >
              {url.shortUrl}
            </a>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Expiration</p>
            <p className="mt-3 text-sm font-medium text-slate-900">
              {url.expiresAt ? formatDateTime(url.expiresAt) : 'No expiration'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Recent visit details</h3>
            <p className="mt-2 text-sm text-slate-600">Last known visit information for this short link.</p>
          </div>
          <Link
            to="/"
            className="inline-flex rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back to home
          </Link>
        </div>

        {lastVisit ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Referrer</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{truncate(lastVisit.referrer || 'Direct')}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">IP address</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{lastVisit.ipAddress || 'Unknown'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">User agent</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{truncate(lastVisit.userAgent, 120)}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-slate-500">
            No visit details are available yet.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-900">Click history</h3>
        <p className="mt-2 text-sm text-slate-600">Daily click count for the last two weeks.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {dailyClickCounts.map((item) => (
                <tr key={item.date}>
                  <td className="px-4 py-3 text-slate-700">{item.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
