import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

function isExpired(url) {
  return Boolean(url.expiresAt && new Date(url.expiresAt) <= new Date());
}

function getLinkSignal(url) {
  if (isExpired(url)) {
    return { label: 'Expired', className: 'bg-red-50 text-red-700' };
  }

  if (url.expiresAt) {
    const daysUntilExpiration = Math.ceil((new Date(url.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiration <= 7) {
      return { label: 'Expires Soon', className: 'bg-amber-50 text-amber-700' };
    }
  }

  if (Number(url.clicks || 0) >= 100) {
    return { label: 'Top Performer', className: 'bg-cyan-50 text-cyan-700' };
  }

  if (Number(url.clicks || 0) === 0) {
    return { label: 'Quiet', className: 'bg-slate-100 text-slate-600' };
  }

  return { label: 'Healthy', className: 'bg-emerald-50 text-emerald-700' };
}

function getCampaignLabel(url) {
  const source = `${url.shortCode || ''} ${url.longUrl || ''}`.toLowerCase();

  if (source.includes('utm_medium=email') || source.includes('newsletter') || source.includes('email')) return 'Email';
  if (source.includes('instagram') || source.includes('facebook') || source.includes('twitter') || source.includes('linkedin') || source.includes('social')) return 'Social';
  if (source.includes('launch') || source.includes('campaign')) return 'Launch';
  if (source.includes('qr')) return 'QR Print';
  if (url.expiresAt) return 'Temporary';

  return 'General';
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [urls, setUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [expiresAtInput, setExpiresAtInput] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkError, setBulkError] = useState('');
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
    const prefillUrl = location.state?.prefillUrl;
    if (prefillUrl) {
      setUrlInput(prefillUrl);
    }
  }, [location.state]);

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

    if (expiresAtInput && new Date(expiresAtInput) <= new Date()) {
      setError('Expiration date must be in the future.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/api/urls', {
        longUrl: urlInput.trim(),
        alias: aliasInput.trim() || undefined,
        expiresAt: expiresAtInput || undefined
      });
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
      setAliasInput('');
      setExpiresAtInput('');
      setSelectedUrl(newUrl);
      setNotification('URL shortened successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to shorten the URL.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = async (event) => {
    event.preventDefault();
    setBulkError('');
    setNotification('');
    setBulkResults(null);

    if (!bulkFile) {
      setBulkError('Please choose a CSV file to upload.');
      return;
    }

    setBulkUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      const response = await api.post('/api/urls/bulk', formData);
      setBulkResults(response.data.results || []);
      setNotification('CSV upload processed successfully.');
    } catch (err) {
      setBulkError(err?.response?.data?.message || 'Unable to upload CSV file.');
    } finally {
      setBulkUploading(false);
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

  const stats = useMemo(() => {
    const expiredLinks = urls.filter(isExpired).length;
    return {
      totalLinks: urls.length,
      totalClicks: urls.reduce((sum, url) => sum + Number(url.clicks || 0), 0),
      activeLinks: urls.length - expiredLinks,
      expiredLinks
    };
  }, [urls]);

  const selectedSignal = selectedUrl ? getLinkSignal(selectedUrl) : null;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950">Control every ByteLink from one workspace</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Create short links, monitor performance, manage QR codes, and process CSV campaigns without changing how your data flows.
          </p>
        </div>
        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold text-slate-500">Signed in as</p>
          <p className="mt-2 break-all text-xl font-semibold text-slate-950">{user?.email}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="soft-panel p-4">
              <p className="text-slate-500">Matched links</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{filteredUrls.length}</p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-slate-500">Current page</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{currentPage}/{pageCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Links', stats.totalLinks, 'L'],
          ['Total Clicks', stats.totalClicks, 'C'],
          ['Active Links', stats.activeLinks, 'A'],
          ['Expired Links', stats.expiredLinks, 'E']
        ].map(([label, value, icon]) => (
          <article className="metric-card" key={label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
              </div>
              <span className="metric-icon">{icon}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">Create Link</h2>
            <p className="mt-2 text-sm text-slate-600">Paste, customize, generate, then copy or download the QR code.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ['1', 'Paste URL'],
            ['2', 'Customize'],
            ['3', 'Generate'],
            ['4', 'Copy or QR']
          ].map(([step, label]) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700">{step}</span>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
          ))}
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              className="form-input min-h-[58px] flex-1"
              placeholder="https://example.com/very/long/url"
              type="url"
              aria-label="Long URL"
            />
            <button type="submit" disabled={saving} className="btn-primary min-h-[58px] px-8 disabled:cursor-not-allowed disabled:bg-slate-400">
              {saving ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>

          <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">Advanced options</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                <span className="label-text">Alias</span>
                <input
                  value={aliasInput}
                  onChange={(event) => setAliasInput(event.target.value)}
                  className="form-input"
                  placeholder="campaign-launch"
                  type="text"
                />
                <p className="mt-2 text-xs text-slate-500">4-30 characters, letters, numbers, hyphens, and underscores only.</p>
              </label>
              <label>
                <span className="label-text">Expiration Date</span>
                <input
                  value={expiresAtInput}
                  onChange={(event) => setExpiresAtInput(event.target.value)}
                  className="form-input"
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="mt-2 text-xs text-slate-500">Optional. The link will stop redirecting after this date and time.</p>
              </label>
            </div>
          </details>
        </form>

        {(error || notification || bulkError) && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {bulkError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{bulkError}</div>}
            {notification && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notification}</div>}
          </div>
        )}
      </section>

      {selectedUrl && (
        <section className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-emerald-600">Your ByteLink is Ready</p>
              <a href={selectedUrl.shortUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-2xl font-semibold text-slate-950 hover:text-cyan-700">
                {selectedUrl.shortUrl}
              </a>
              <p className="mt-2 break-all text-sm text-slate-500">{selectedUrl.longUrl}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleCopy(selectedUrl.shortUrl)} className="btn-primary">
                Copy
              </button>
              <a href={selectedUrl.shortUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                Open
              </a>
              <a href={selectedUrl.qrCodeUrl} download={`${selectedUrl.shortCode}.png`} className="btn-secondary">
                QR Code
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">Recent Activity</h2>
            <p className="mt-2 text-sm text-slate-600">Search, sort, inspect, and manage the URLs you have created.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="form-input"
              placeholder="Search URLs"
              type="search"
              aria-label="Search URLs"
            />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="form-input" aria-label="Sort URLs">
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most-clicks">Most clicks</option>
              <option value="least-clicks">Least clicks</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">Loading your URLs...</div>
        ) : urls.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-lg font-semibold text-slate-950">Your first ByteLink starts here</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Create a short link above and this workspace will turn into a searchable campaign activity table.</p>
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-lg font-semibold text-slate-950">No matching ByteLinks</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Try a short code, original domain, or campaign term.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 table-shell">
              <table className="data-table min-w-[1120px]">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short URL</th>
                    <th>Campaign</th>
                    <th>Clicks</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>QR</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageUrls.map((url) => {
                    const signal = getLinkSignal(url);

                    return (
                      <tr key={url.id}>
                        <td>
                          <a className="block max-w-[260px] truncate font-medium text-slate-950 hover:text-cyan-700" href={url.longUrl} target="_blank" rel="noreferrer">
                            {url.longUrl}
                          </a>
                          <span className={`status-pill mt-2 ${signal.className}`}>{signal.label}</span>
                        </td>
                        <td>
                          <div className="flex max-w-[260px] items-center gap-2">
                            <a className="truncate font-medium text-cyan-700 hover:text-cyan-800" href={url.shortUrl} target="_blank" rel="noreferrer">
                              {url.shortUrl}
                            </a>
                            <button type="button" onClick={() => handleCopy(url.shortUrl)} className="action-icon" title="Copy short URL" aria-label={`Copy ${url.shortUrl}`}>
                              Copy
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="status-pill bg-slate-100 text-slate-700">{getCampaignLabel(url)}</span>
                        </td>
                        <td className="font-semibold text-slate-950">{url.clicks}</td>
                        <td>{formatDate(url.createdAt)}</td>
                        <td>
                          <span className={`status-pill ${isExpired(url) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {isExpired(url) ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <a href={url.qrCodeUrl} download={`${url.shortCode}.png`} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-cyan-700">
                            <img src={url.qrCodeUrl} alt={`QR code for ${url.shortUrl}`} className="h-10 w-10 rounded-xl border border-slate-200 bg-white p-1" />
                            QR
                          </a>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setSelectedUrl(url)} className="action-icon" title="View stats" aria-label={`View stats for ${url.shortUrl}`}>
                              Stats
                            </button>
                            <a href={url.shortUrl} target="_blank" rel="noreferrer" className="action-icon" title="Open link" aria-label={`Open ${url.shortUrl}`}>
                              Open
                            </a>
                            <a href={url.qrCodeUrl} download={`${url.shortCode}.png`} className="action-icon" title="Download QR code" aria-label={`Download QR code for ${url.shortUrl}`}>
                              QR
                            </a>
                            <button type="button" onClick={() => handleDelete(url.id)} disabled={deletingId === url.id} className="btn-danger min-h-[34px] px-3 text-xs disabled:cursor-not-allowed disabled:opacity-60">
                              {deletingId === url.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-600">
                Showing {pageUrls.length} of {filteredUrls.length} links. Page {currentPage} of {pageCount}.
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((current) => Math.max(1, current - 1))} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
                  Previous
                </button>
                <button type="button" disabled={currentPage === pageCount} onClick={() => setCurrentPage((current) => Math.min(pageCount, current + 1))} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-3xl font-semibold text-slate-950">Bulk Upload</h2>
          <p className="mt-2 text-sm text-slate-600">Upload a CSV file with longUrl, alias, and expiresAt columns.</p>

          <form className="mt-6" onSubmit={handleBulkUpload}>
            <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-cyan-400 hover:bg-cyan-50/40">
              <span className="metric-icon">CSV</span>
              <span className="mt-4 text-sm font-semibold text-slate-950">{bulkFile ? bulkFile.name : 'Choose a CSV file'}</span>
              <span className="mt-1 text-xs text-slate-500">Drag-and-drop style upload area</span>
              <input type="file" accept=".csv" onChange={(event) => setBulkFile(event.target.files?.[0] || null)} className="sr-only" />
            </label>
            <button type="submit" disabled={bulkUploading} className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-slate-400">
              {bulkUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </form>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-3xl font-semibold text-slate-950">Upload Results</h2>
          <p className="mt-2 text-sm text-slate-600">Processed CSV rows appear here after upload.</p>
          {bulkResults ? (
            <div className="mt-6 table-shell">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Status</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((result) => (
                    <tr key={result.row}>
                      <td className="font-semibold text-slate-950">{result.row}</td>
                      <td>
                        {result.error ? (
                          <span className="status-pill bg-red-50 text-red-700">Error</span>
                        ) : (
                          <span className="status-pill bg-emerald-50 text-emerald-700">Created</span>
                        )}
                      </td>
                      <td>{result.error ? result.error : `Short URL: ${result.url.shortUrl}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No CSV results yet.
            </div>
          )}
        </div>
      </section>

      {selectedUrl && (
        <>
          <button type="button" className="drawer-backdrop" aria-label="Close link details" onClick={() => setSelectedUrl(null)} />
          <aside className="detail-drawer" aria-label="Link details">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Link Detail</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">ByteLink Snapshot</h2>
                </div>
                <button type="button" onClick={() => setSelectedUrl(null)} className="action-icon" aria-label="Close link details">
                  X
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSignal && <span className={`status-pill ${selectedSignal.className}`}>{selectedSignal.label}</span>}
                <span className="status-pill bg-slate-100 text-slate-700">{getCampaignLabel(selectedUrl)}</span>
                <span className={`status-pill ${isExpired(selectedUrl) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isExpired(selectedUrl) ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <p className="label-text">Short URL</p>
                <a href={selectedUrl.shortUrl} target="_blank" rel="noreferrer" className="block break-all text-lg font-semibold text-cyan-700 hover:text-cyan-800">
                  {selectedUrl.shortUrl}
                </a>
                <p className="mt-2 break-all text-sm text-slate-500">{selectedUrl.longUrl}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="soft-panel p-4">
                  <p className="text-sm text-slate-500">Clicks captured</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedUrl.clicks}</p>
                </div>
                <div className="soft-panel p-4">
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatDate(selectedUrl.createdAt)}</p>
                </div>
              </div>

              <div className="soft-panel p-5">
                <div className="flex flex-col items-center gap-4 text-center">
                  <img src={selectedUrl.qrCodeUrl} alt={`QR code for ${selectedUrl.shortUrl}`} className="h-44 w-44 rounded-2xl border border-slate-200 bg-white p-3" />
                  <div>
                    <p className="text-base font-semibold text-slate-950">QR ready</p>
                    <p className="mt-1 text-sm text-slate-500">Download this QR code for offline placement and printed campaigns.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <button type="button" onClick={() => handleCopy(selectedUrl.shortUrl)} className="btn-primary w-full">
                  Copy Short URL
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <a href={selectedUrl.shortUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                    Open
                  </a>
                  <a href={selectedUrl.qrCodeUrl} download={`${selectedUrl.shortCode}.png`} className="btn-secondary">
                    Download QR
                  </a>
                </div>
              </div>

              <div className="soft-panel p-5">
                <h3 className="text-base font-semibold text-slate-950">Expiration</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedUrl.expiresAt ? `Expires ${formatDate(selectedUrl.expiresAt)}` : 'No expiration date set.'}
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
