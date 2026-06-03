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
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
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
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          borderColor: 'rgba(6, 182, 212, 1)',
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(8, 145, 178, 1)'
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
        position: 'top',
        labels: {
          color: '#334155',
          boxWidth: 10,
          usePointStyle: true
        }
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
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        ticks: {
          precision: 0,
          color: '#64748b'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)'
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Analytics</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950">Performance intelligence for every link</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review traffic trends, recent visits, QR usage, and link performance in one responsive dashboard.
            </p>
          </div>
          <div className="soft-panel px-4 py-3 text-slate-700">
            <p className="eyebrow">Last refresh</p>
            <p className="mt-1 text-base font-medium text-slate-900">
              {analytics ? formatDateTime(analytics.lastVisitedAt) : 'Loading...'}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="surface-card p-8 text-center text-slate-500">Loading analytics...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Total clicks', analytics.totalClicks, 'C', 'Clicks across all active links.'],
              ['Active links', analytics.activeUrls, 'A', 'URLs currently being tracked.'],
              ['Avg clicks / day', analytics.averageClicksPerDay, 'D', 'Average daily click activity.'],
              ['Peak day clicks', peakDayClicks, 'P', 'Largest single-day click total.']
            ].map(([label, value, icon, helper]) => (
              <article className="metric-card" key={label}>
                <span className="metric-icon">{icon}</span>
                <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
                <p className="mt-2 text-sm text-slate-500">{helper}</p>
              </article>
            ))}
          </div>

          <section className="surface-card p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Daily click trend</h2>
                <p className="mt-2 text-sm text-slate-500">Track how clicks move over the last two weeks.</p>
              </div>
              <div className="status-pill bg-cyan-50 text-cyan-700">
                {analytics.dailyClickCounts.reduce((sum, item) => sum + item.count, 0)} clicks over {analytics.dailyClickCounts.length} days
              </div>
            </div>
            <div className="mt-8 h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <section className="surface-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Top URLs</h2>
                  <p className="mt-2 text-sm text-slate-500">Your most clicked links this period.</p>
                </div>
                <span className="status-pill bg-slate-50 text-slate-500">Top 5</span>
              </div>

              <div className="mt-6 table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Short Code</th>
                      <th>Clicks</th>
                      <th>URL</th>
                      <th>QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topUrls.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-sm text-slate-500">
                          No URL visits yet.
                        </td>
                      </tr>
                    ) : (
                      analytics.topUrls.map((item) => (
                        <tr key={item.id}>
                          <td className="font-medium text-slate-950">{item.shortCode}</td>
                          <td>{item.clicks}</td>
                          <td>{truncateText(item.longUrl, 60)}</td>
                          <td>
                            {item.qrCodeUrl ? (
                              <div className="flex items-center gap-2">
                                <img src={item.qrCodeUrl} alt={`QR for ${item.shortCode}`} className="h-14 w-14 rounded-2xl border border-slate-200" />
                                <a href={item.qrCodeUrl} download={`${item.shortCode}.png`} className="btn-secondary min-h-9 px-3 text-xs">
                                  Download
                                </a>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500">Not ready</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="surface-card p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {[
                  ['Top browsers', analytics.browserCounts],
                  ['Top operating systems', analytics.osCounts],
                  ['Top device types', analytics.deviceCounts]
                ].map(([label, items]) => (
                  <article className="soft-panel p-6" key={label}>
                    <p className="eyebrow">{label}</p>
                    <div className="mt-4 space-y-3">
                      {items.slice(0, 3).map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span className="truncate">{item.label}</span>
                          <span className="font-semibold text-slate-950">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="surface-card p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Top countries', analytics.countryCounts],
                  ['Top cities', analytics.cityCounts]
                ].map(([label, items]) => (
                  <article className="soft-panel p-6" key={label}>
                    <p className="eyebrow">{label}</p>
                    <div className="mt-4 space-y-3">
                      {items.slice(0, 4).map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span className="truncate">{item.label}</span>
                          <span className="font-semibold text-slate-950">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="surface-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-950">Recent visits</h2>
              <p className="mt-2 text-sm text-slate-500">Latest click activity recorded across your links.</p>

              <div className="mt-6 space-y-4">
                {analytics.recentVisits.length === 0 ? (
                  <div className="soft-panel p-6 text-center text-sm text-slate-500">No visit data available yet.</div>
                ) : (
                  analytics.recentVisits.map((visit, index) => (
                    <article key={`${visit.visitedAt}-${index}`} className="soft-panel p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Visited</p>
                          <p className="mt-1 font-medium text-slate-950">{formatDateTime(visit.visitedAt)}</p>
                        </div>
                        <div className="status-pill bg-white text-slate-500">{visit.ipAddress || 'Unknown IP'}</div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-950">URL:</span> {truncateText(visit.longUrl ?? visit.referrer ?? 'Unknown', 70)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-950">Referrer:</span> {visit.referrer || 'Direct'}
                        </p>
                        <p>
                          <span className="font-medium text-slate-950">User agent:</span> {truncateText(visit.userAgent, 70)}
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
