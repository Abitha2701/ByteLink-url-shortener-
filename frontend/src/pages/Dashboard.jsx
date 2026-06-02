import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 6;

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
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (!notification) return undefined;

    const timer = window.setTimeout(() => setNotification(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const filteredUrls = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return urls;

    return urls.filter((url) => {
      return (
        url.longUrl.toLowerCase().includes(query) ||
        url.shortUrl.toLowerCase().includes(query) ||
        url.shortCode.toLowerCase().includes(query)
      );
    });
  }, [urls, searchQuery]);

  const sortedUrls = useMemo(() => {
    const list = [...filteredUrls];

    list.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'most-clicks') {
        return b.clicks - a.clicks;
      }
      if (sortBy === 'least-clicks') {
        return a.clicks - b.clicks;
      }
      return 0;
    });

    return list;
  }, [filteredUrls, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sortedUrls.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const pageUrls = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedUrls.slice(start, start + PAGE_SIZE);
  }, [sortedUrls, currentPage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotification('');

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
      setNotification('URL shortened successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to shorten the URL.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setDeletingId(id);

    try {
      await api.delete(`/api/urls/${id}`);
      setUrls((current) => current.filter((url) => url.id !== id));
      if (selectedUrl?.id === id) {
        setSelectedUrl(null);
      }
      setNotification('URL deleted successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete the URL.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification('Copied to clipboard!');
    } catch {
      setError('Copy failed. Please try again.');
    }
  };

  const activeCount = useMemo(() => urls.length, [urls]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage your shortened URLs, search existing links, and sort by performance.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">URLs created</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{activeCount}</p>
          </div>
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr_auto]" onSubmit={handleSubmit}>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Search</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Search by URL or code"
                type="search"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="latest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most-clicks">Most clicks</option>
                <option value="least-clicks">Least clicks</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-14 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Shortening…' : 'Shorten URL'}
          </button>
        </form>

        {(error || notification) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {notification && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notification}</div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Your shortened URLs</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Browse the links you created and sort or search to find the data you need.
            </p>
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
        ) : filteredUrls.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            No URLs match your search. Try a different keyword.
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Showing {pageUrls.length} of {filteredUrls.length} links
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">Page {currentPage}</span>
                <span>of {pageCount}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {pageUrls.map((url) => (
                <article
                  key={url.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6"
                >
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

                  <div className="mt-6 flex flex-col gap-4 md:mt-0 md:items-end md:justify-between">
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">QR Code</p>
                      <img
                        src={url.qrCodeUrl}
                        alt={`QR code for ${url.shortUrl}`}
                        className="mt-3 h-40 w-40 rounded-3xl border border-slate-200 object-cover"
                      />
                      <a
                        href={url.qrCodeUrl}
                        download={`${url.shortCode}.png`}
                        className="mt-3 inline-flex w-full justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Download QR
                      </a>
                    </div>
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
                      disabled={deletingId === url.id}
                      className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === url.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {pageCount} • {filteredUrls.length} links matched
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() => setCurrentPage((current) => Math.min(pageCount, current + 1))}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedUrl && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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

          <div className="mt-8 rounded-3xl bg-slate-50 p-6 shadow-sm sm:p-8">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Selected URL QR code</p>
            <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <img
                src={selectedUrl.qrCodeUrl}
                alt={`QR code for ${selectedUrl.shortUrl}`}
                className="h-48 w-48 rounded-3xl border border-slate-200 bg-white p-4"
              />
              <div className="space-y-3 text-center sm:text-left">
                <p className="text-sm text-slate-600">Scan or download the QR code for this shortened link.</p>
                <a
                  href={selectedUrl.qrCodeUrl}
                  download={`${selectedUrl.shortCode}.png`}
                  className="inline-flex rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Download QR Code
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
