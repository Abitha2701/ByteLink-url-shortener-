import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Your profile</h2>
          <p className="mt-2 text-sm text-slate-600">Welcome back, {user?.name || 'user'}.</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</h3>
          <p className="mt-3 text-lg text-slate-900">{user?.email}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Member since</h3>
          <p className="mt-3 text-lg text-slate-900">{new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-base font-semibold text-slate-900">Session</h3>
        <p className="mt-2 text-sm text-slate-600">Your login is persisted automatically so you stay signed in while the token is valid.</p>
      </div>
    </div>
  );
}
