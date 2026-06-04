import { useState } from 'react';
import api from '../lib/api';

function formatCsvResultRowText(result) {
  if (result?.error) return result.error;
  if (result?.url?.shortUrl) return `Short URL: ${result.url.shortUrl}`;
  return 'Created';
}

export default function BulkUpload() {
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResults, setCsvResults] = useState(null);
  const [csvError, setCsvError] = useState('');

  const [textInput, setTextInput] = useState('');
  const [textUploading, setTextUploading] = useState(false);
  const [textResults, setTextResults] = useState(null);
  const [textError, setTextError] = useState('');

  const [notification, setNotification] = useState('');

  const handleCsvUpload = async (event) => {
    event.preventDefault();
    setCsvError('');
    setNotification('');
    setCsvResults(null);

    if (!csvFile) {
      setCsvError('Please choose a CSV file to upload.');
      return;
    }

    setCsvUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await api.post('/api/urls/bulk', formData);
      setCsvResults(response.data.results || []);
      setNotification('CSV upload processed successfully.');
    } catch (err) {
      setCsvError(err?.response?.data?.message || 'Unable to upload CSV file.');
    } finally {
      setCsvUploading(false);
    }
  };

  const handleTextUpload = async (event) => {
    event.preventDefault();
    setTextError('');
    setNotification('');
    setTextResults(null);

    const trimmed = (textInput || '').trim();
    if (!trimmed) {
      setTextError('Paste your rows first.');
      return;
    }

    // Backend bulkCreateShortUrls expects a CSV file buffer; we pass textarea content as CSV-like text.
    setTextUploading(true);
    try {
      const formData = new FormData();
      const blob = new Blob([trimmed], { type: 'text/csv;charset=utf-8' });
      const file = new File([blob], 'bulk.txt.csv', { type: 'text/csv' });
      formData.append('file', file);

      const response = await api.post('/api/urls/bulk', formData);
      setTextResults(response.data.results || []);
      setNotification('Text bulk upload processed successfully.');
    } catch (err) {
      setTextError(err?.response?.data?.message || 'Unable to process text bulk upload.');
    } finally {
      setTextUploading(false);
    }
  };

  const renderResultsTable = (results) => {
    if (!results) return null;

    return (
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
            {results.map((result) => (
              <tr key={result.row}>
                <td className="font-semibold text-slate-950">{result.row}</td>
                <td>
                  {result.error ? (
                    <span className="status-pill bg-red-50 text-red-700">Error</span>
                  ) : (
                    <span className="status-pill bg-emerald-50 text-emerald-700">Created</span>
                  )}
                </td>
                <td className="text-slate-700">{formatCsvResultRowText(result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Bulk Upload</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950">Create campaigns in bulk</h1>
            <p className="mt-2 text-sm text-slate-600">
              Upload a CSV file or paste rows directly. Each row can include <b>longUrl</b>, <b>alias</b>, and <b>expiresAt</b>.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-3xl font-semibold text-slate-950">CSV Upload</h2>
          <p className="mt-2 text-sm text-slate-600">Upload a CSV with columns: longUrl, alias, expiresAt</p>

          <form className="mt-6" onSubmit={handleCsvUpload}>
            <label className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-cyan-400 hover:bg-cyan-50/40">
              <span className="metric-icon">CSV</span>
              <span className="mt-4 text-sm font-semibold text-slate-950">{csvFile ? csvFile.name : 'Choose a CSV file'}</span>
              <span className="mt-1 text-xs text-slate-500">Drag-and-drop style upload area</span>
              <input
                type="file"
                accept=".csv"
                onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>

            <button type="submit" disabled={csvUploading} className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-slate-400">
              {csvUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </form>

          {(csvError || notification) && (
            <div className="mt-5 grid gap-3 sm:grid-cols-1">
              {csvError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{csvError}</div>}
              {notification && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notification}</div>}
            </div>
          )}

          {renderResultsTable(csvResults)}
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-3xl font-semibold text-slate-950">Text Upload</h2>
          <p className="mt-2 text-sm text-slate-600">
            Paste CSV-like rows. One row per line:
            <br />
            <span className="font-semibold text-slate-800">longUrl,alias,expiresAt</span>
          </p>

          <form className="mt-6" onSubmit={handleTextUpload}>
            <label className="block">
              <span className="label-text">Rows</span>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="form-input"
                style={{ borderRadius: 16, minHeight: 220, padding: '14px 18px', whiteSpace: 'pre' }}
                placeholder={
                  'https://example.com,alias1,2026-12-31T23:59:59Z\n' +
                  'https://example.org,alias2,\n' +
                  'https://example.net,,2026-11-01T12:00:00Z'
                }
              />
            </label>

            <button type="submit" disabled={textUploading} className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-slate-400">
              {textUploading ? 'Processing...' : 'Process Text'}
            </button>
          </form>

          {textError && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{textError}</div>}

          {renderResultsTable(textResults)}
        </div>
      </section>
    </div>
  );
}

