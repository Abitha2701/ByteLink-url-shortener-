function Home() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-semibold text-slate-900">Welcome to Bytelink</h2>
      <p className="mt-4 max-w-2xl text-slate-600">
        You’re looking at a polished starter project for a full-stack URL shortener. The structure is set up, the styles are ready, and the backend connection is waiting for your business logic.
      </p>
      <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-slate-700">
        <p className="font-medium">What’s included so far:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>React app with route handling for home and 404 pages</li>
          <li>Express server with a health check endpoint</li>
          <li>MongoDB connection boilerplate with dotenv setup</li>
          <li>Tailwind CSS, ESLint, and Vite configuration</li>
        </ul>
      </div>
      <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-slate-700">
        <p className="font-medium">Recommended next steps:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Define the shortened URL schema and API routes</li>
          <li>Add the form UI for creating shortened links</li>
          <li>Wire frontend requests to the backend API</li>
        </ol>
      </div>
    </section>
  );
}

export default Home;
