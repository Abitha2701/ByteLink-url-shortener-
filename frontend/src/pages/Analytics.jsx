import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function formatDateTime(value) {
  if (!value) {
    return 'No visits yet';
  }

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function truncateText(text, maxLength = 48) {
  if (!text) return '-';
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .get('/api/urls/analytics')
      .then((response) => {
        setAnalytics(response.data.analytics);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to load analytics.');
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!analytics) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: analytics.dailyClickCounts.map((item) => item.date.slice(5)),
      datasets: [
        {
          label: 'Daily Clicks',
          data: analytics.dailyClickCounts.map((item) => item.count),
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.18)',
          borderColor: 'rgba(59, 130, 246, 1)',
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)'
        }
      ]
    };
  }, [analytics]);

  const peakDayClicks = useMemo(() => {
    if (!analytics) return 0;
    return analytics.dailyClickCounts.reduce((max, item) => Math.max(max, item.count), 0);
  }, [analytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          precision: 0
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)'
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Analytics</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review your traffic trends, recent visits, and link performance in one responsive dashboard.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Last refresh</p>
            <p className="mt-1 text-base font-medium text-slate-900">
              {analytics ? formatDateTime(analytics.lastVisitedAt) : 'Loading…'}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center text-slate-500">Loading analytics…</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total clicks</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{analytics.totalClicks}</p>
              <p className="mt-2 text-sm text-slate-500">Clicks across all active links.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active links</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{analytics.activeUrls}</p>
              <p className="mt-2 text-sm text-slate-500">URLs currently being tracked.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Avg clicks / day</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{analytics.averageClicksPerDay}</p>
              <p className="mt-2 text-sm text-slate-500">Average daily click activity.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Peak day clicks</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{peakDayClicks}</p>
              <p className="mt-2 text-sm text-slate-500">Largest single-day click total.</p>
            </article>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Daily click trend</h3>
                <p className="mt-2 text-sm text-slate-500">Track how clicks move over the last two weeks.</p>
              </div>
              <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700">
                {analytics.dailyClickCounts.reduce((sum, item) => sum + item.count, 0)} clicks over {analytics.dailyClickCounts.length} days
              </div>
            </div>
            <div className="mt-8 h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Top URLs</h3>
                  <p className="mt-2 text-sm text-slate-500">Your most clicked links this period.</p>
                </div>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Top 5
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-600">Short Code</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Clicks</th>
                      <th className="px-4 py-3 font-medium text-slate-600">URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {analytics.topUrls.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-sm text-slate-500">
                          No URL visits yet.
                        </td>
                      </tr>
                    ) : (
                      analytics.topUrls.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 font-medium text-slate-900">{item.shortCode}</td>
                          <td className="px-4 py-4 text-slate-700">{item.clicks}</td>
                          <td className="px-4 py-4 text-slate-600">{truncateText(item.longUrl, 60)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900">Recent visits</h3>
              <p className="mt-2 text-sm text-slate-500">Latest click activity recorded across your links.</p>

              <div className="mt-6 space-y-4">
                {analytics.recentVisits.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No visit data available yet.
                  </div>
                ) : (
                  analytics.recentVisits.map((visit, index) => (
                    <article key={`${visit.visitedAt}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Visited</p>
                          <p className="mt-1 font-medium text-slate-900">{formatDateTime(visit.visitedAt)}</p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                          {visit.ipAddress || 'Unknown IP'}
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-900">URL:</span> {truncateText(visit.longUrl ?? visit.referrer ?? 'Unknown', 70)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Referrer:</span> {visit.referrer || 'Direct'}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">User agent:</span> {truncateText(visit.userAgent, 70)}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
