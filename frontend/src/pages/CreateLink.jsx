import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isExpired(url) {
  return Boolean(url.expiresAt && new Date(url.expiresAt) <= new Date());
}

function getCampaignLabel(url) {
  const source = `${url.shortCode || ''} ${url.longUrl || ''}`.toLowerCase();

  if (source.includes('utm_medium=email') || source.includes('newsletter') || source.includes('email')) return 'Email';
  if (
    source.includes('instagram') ||
    source.includes('facebook') ||
    source.includes('twitter') ||
    source.includes('linkedin') ||
    source.includes('social')
  )
    return 'Social';
  if (source.includes('launch') || source.includes('campaign')) return 'Launch';
  if (source.includes('qr')) return 'QR Print';
  if (url.expiresAt) return 'Temporary';

  return 'General';
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

export default function CreateLink() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [urlInput, setUrlInput] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [expiresAtInput, setExpiresAtInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId] = useState(null);

  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const [selectedUrl, setSelectedUrl] = useState(null);

  const prefilled = urlInput;

  const statsSignal = selectedUrl ? getLinkSignal(selectedUrl) : null;

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
        expiresAt: expiresAtInput || undefined,
      });

      const newUrl = response.data.url;
      setSelectedUrl(newUrl);
      setUrlInput('');
      setAliasInput('');
      setExpiresAtInput('');
      setNotification('URL shortened successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to shorten the URL.');
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Create Link</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950">Shorten a ByteLink in seconds</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Paste a URL, optionally add an alias + expiration, then copy the short link and QR code.
          </p>
        </div>
        <div className="surface-card p-6 sm:p-8">
          <p className="text-sm font-semibold text-slate-500">Signed in as</p>
          <p className="mt-2 break-all text-xl font-semibold text-slate-950">{user?.email}</p>
          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
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
            ['4', 'Copy or QR'],
          ].map(([step, label]) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700">
                {step}
              </span>
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
            <button
              type="submit"
              disabled={saving || loading}
              className="btn-primary min-h-[58px] px-8 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
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
                <p className="mt-2 text-xs text-slate-500">
                  4-30 characters, letters, numbers, hyphens, and underscores only.
                </p>
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

        {(error || notification) && (
          <div className="mt-5 grid gap-3 md:grid-cols-1">
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {notification && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notification}</div>
            )}
          </div>
        )}
      </section>

      {selectedUrl && (
        <section className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-emerald-600">Your ByteLink is Ready</p>
              <a
                href={selectedUrl.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block break-all text-2xl font-semibold text-slate-950 hover:text-cyan-700"
              >
                {selectedUrl.shortUrl}
              </a>
              <p className="mt-2 break-all text-sm text-slate-500">{selectedUrl.longUrl}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {statsSignal && <span className={`status-pill ${statsSignal.className}`}>{statsSignal.label}</span>}
                <span className="status-pill bg-slate-100 text-slate-700">{getCampaignLabel(selectedUrl)}</span>
                <span className={`status-pill ${isExpired(selectedUrl) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isExpired(selectedUrl) ? 'Expired' : 'Active'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleCopy(selectedUrl.shortUrl)} className="btn-primary">
                Copy
              </button>
              <a href={selectedUrl.shortUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                Open
              </a>
              <a
                href={selectedUrl.qrCodeUrl}
                download={`${selectedUrl.shortCode}.png`}
                className="btn-secondary"
              >
                QR Code
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="soft-panel p-4">
              <p className="text-sm text-slate-500">Clicks captured</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedUrl.clicks}</p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-sm text-slate-500">Created</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{formatDate(selectedUrl.createdAt)}</p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-sm text-slate-500">Expiration</p>
              <p className="mt-2 text-sm text-slate-600">
                {selectedUrl.expiresAt ? `Expires ${formatDate(selectedUrl.expiresAt)}` : 'No expiration date set.'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

