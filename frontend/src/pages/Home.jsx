import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [landingUrl, setLandingUrl] = useState('');
  const navigate = useNavigate();

  const handleLandingSubmit = (event) => {
    event.preventDefault();
    navigate('/dashboard', { state: { prefillUrl: landingUrl.trim() } });
  };

  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-4xl py-4 text-center">
        <div>
          <p className="eyebrow">ByteLink</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-normal text-slate-950">
            The Analytics-First URL Shortener
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Create branded short links, track every click, export QR codes, and understand performance from one clean dashboard.
          </p>

          <form className="mt-8 surface-card p-3 text-left" onSubmit={handleLandingSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={landingUrl}
                onChange={(event) => setLandingUrl(event.target.value)}
                className="form-input min-h-[56px] flex-1"
                type="url"
                placeholder="Paste a long URL to start"
                aria-label="Long URL"
              />
              <button className="btn-primary min-h-[56px] px-7" type="submit">
                Shorten URL
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Optional Alias</p>
                <p className="mt-1 text-sm text-slate-700">Create memorable campaign links.</p>
              </div>
              <div className="soft-panel px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Expiration Settings</p>
                <p className="mt-1 text-sm text-slate-700">Set time limits for temporary URLs.</p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="metric-card">
          <span className="metric-icon">A</span>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">Analytics Built In</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Review clicks, visits, locations, devices, browsers, and high-performing URLs without leaving the product.</p>
        </article>
        <article className="metric-card">
          <span className="metric-icon">Q</span>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">QR Ready</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Every shortened URL keeps its QR code workflow intact for easy download and offline sharing.</p>
        </article>
        <article className="metric-card">
          <span className="metric-icon">B</span>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">Bulk Friendly</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Upload CSV files, review results, and manage high-volume campaigns with the same familiar controls.</p>
        </article>
      </section>
    </div>
  );
}

export default Home;
