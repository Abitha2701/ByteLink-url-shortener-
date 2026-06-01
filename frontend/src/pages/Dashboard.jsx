import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/api/urls')
      .then((response) => {
        setUrls(response.data.urls || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to load URLs.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setCopyMessage('');

    if (!urlInput.trim()) {
      setError('Enter a URL to shorten.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/api/urls', { longUrl: urlInput.trim() });
      const newUrl = response.data.url;
      setUrls((current) => {
        const existingIndex = current.findIndex((item) => item.id === newUrl.id);
        if (existingIndex !== -1) {
          const updated = [...current];
          updated[existingIndex] = newUrl;
          return updated;
        }
        return [newUrl, ...current];
      });
      setUrlInput('');
      setSelectedUrl(newUrl);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to shorten the URL.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/api/urls/${id}`);
      setUrls((current) => current.filter((url) => url.id !== id));
      if (selectedUrl?.id === id) {
        setSelectedUrl(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete the URL.');
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied!');
      setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      setCopyMessage('Copy failed.');
    }
  };

  const activeCount = useMemo(() => urls.length, [urls]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">Manage your shortened URLs and monitor performance from one place.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">URLs created</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{activeCount}</p>
          </div>
        </div>

        <form className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Long URL</span>
            <input
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Enter the URL you want to shorten"
              type="url"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="h-14 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Creating…' : 'Shorten URL'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {copyMessage && (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{copyMessage}</div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Your shortened URLs</h3>
            <p className="mt-2 text-sm text-slate-600">Click an item to see quick analytics and manage your links.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            Signed in as {user?.email}
          </span>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Loading your URLs…
          </div>
        ) : urls.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            No URLs yet. Create one to get started.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {urls.map((url) => (
              <article key={url.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:grid md:grid-cols-[1fr_auto] md:gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Original URL</p>
                    <a
                      className="block truncate text-base font-medium text-slate-900 hover:text-slate-700"
                      href={url.longUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {url.longUrl}
                    </a>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Short URL</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        className="text-slate-900 hover:text-slate-700"
                        href={url.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {url.shortUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(url.shortUrl)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Clicks</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{url.clicks}</p>
                    </div>
                    <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Created</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{formatDate(url.createdAt)}</p>
                    </div>
                    <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Status</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">Active</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:mt-0 md:justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedUrl(url)}
                    className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Analytics
                  </button>
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Open link
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(url.id)}
                    className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedUrl && (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Analytics</h3>
              <p className="mt-2 text-sm text-slate-600">Quick insights for the selected link.</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUrl(null)}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Short URL</p>
              <p className="mt-3 break-all text-slate-900">{selectedUrl.shortUrl}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Clicks</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{selectedUrl.clicks}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Created</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{formatDate(selectedUrl.createdAt)}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
