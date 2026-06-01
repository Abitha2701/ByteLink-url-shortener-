import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-semibold">Bytelink</h1>
            <p className="text-sm text-slate-500">A lightweight URL shortener starter kit.</p>
          </div>
          <nav>
            <Link className="text-slate-600 hover:text-slate-900" to="/">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
