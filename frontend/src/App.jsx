import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import CreateLink from './pages/CreateLink';
import BulkUpload from './pages/BulkUpload';

import NotFound from './pages/NotFound';
import PublicStats from './pages/PublicStats';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 py-5 shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between px-4 gap-4">
          <div>
            <h1 className="text-xl font-semibold">Bytelink</h1>
            <p className="text-sm text-slate-500">A lightweight URL shortener starter kit.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link className="text-slate-600 hover:text-slate-900" to="/">
              Home
            </Link>
            {user ? (
              <>
                <Link className="text-slate-600 hover:text-slate-900" to="/dashboard">
                  Dashboard
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/create">
                  Create Link
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/bulk">
                  Bulk Upload
                </Link>
                <Link className="text-slate-600 hover:text-slate-900" to="/analytics">
                  Analytics
                </Link>

                <Link className="text-slate-600 hover:text-slate-900" to="/profile">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="text-slate-600 hover:text-slate-900" to="/login">
                  Login
                </Link>
                <Link className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-white hover:bg-slate-700" to="/signup">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreateLink />
              </RequireAuth>
            }
          />
          <Route
            path="/bulk"
            element={
              <RequireAuth>
                <BulkUpload />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />

          <Route path="/stats/:shortCode" element={<PublicStats />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
