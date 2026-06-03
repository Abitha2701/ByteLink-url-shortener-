import { useState } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import PublicStats from './pages/PublicStats';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold ${
      isActive ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
    }`;

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-base font-bold text-white shadow-[0_4px_20px_rgba(6,182,212,0.18)]">
              B
            </span>
            <span>
              <span className="block text-lg font-bold text-slate-950">ByteLink</span>
              <span className="block text-xs text-slate-500">Analytics-first URLs</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="btn-secondary h-11 w-11 px-0 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? 'X' : 'Menu'}
          </button>

          <nav
            className={`absolute left-4 right-4 top-[74px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_20px_rgba(15,23,42,0.06)] md:static md:flex md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
              menuOpen ? 'block' : 'hidden'
            }`}
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <NavLink className={navLinkClass} to="/" onClick={() => setMenuOpen(false)}>
                Home
              </NavLink>
            {user ? (
              <>
                <NavLink className={navLinkClass} to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink className={navLinkClass} to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Create Link
                </NavLink>
                <NavLink className={navLinkClass} to="/analytics" onClick={() => setMenuOpen(false)}>
                  Analytics
                </NavLink>
                <NavLink className={navLinkClass} to="/profile" onClick={() => setMenuOpen(false)}>
                  {user?.name || 'Profile'}
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="btn-secondary mt-2 md:mt-0"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className={navLinkClass} to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </NavLink>
                <Link className="btn-primary mt-2 md:mt-0" to="/signup" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
            </div>
          </nav>
        </div>
      </header>

      <main className="page-wrap">
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>ByteLink keeps links short and analytics clear.</p>
          <div className="flex gap-4">
            <Link className="hover:text-slate-950" to="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-slate-950" to="/analytics">
              Analytics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
