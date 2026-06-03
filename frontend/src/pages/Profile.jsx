import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Profile</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950">Account Information</h1>
            <p className="mt-2 text-sm text-slate-600">Welcome back, {user?.name || 'user'}.</p>
          </div>
          <button type="button" onClick={logout} className="btn-primary">
            Logout
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="metric-card">
          <span className="metric-icon">M</span>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">Email</h2>
          <p className="mt-3 break-all text-base text-slate-700">{user?.email}</p>
        </article>
        <article className="metric-card">
          <span className="metric-icon">D</span>
          <h2 className="mt-5 text-xl font-semibold text-slate-950">Member since</h2>
          <p className="mt-3 text-base text-slate-700">{new Date(user?.createdAt).toLocaleDateString()}</p>
        </article>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
        <div className="mt-5 soft-panel p-6">
          <h3 className="text-base font-semibold text-slate-950">Session</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your login is persisted automatically so you stay signed in while the token is valid.
          </p>
        </div>
      </section>
    </div>
  );
}
