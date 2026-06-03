import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/profile';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setAuthError(null);

    if (!email || !password) {
      setFormError('Please fill in both email and password.');
      return;
    }

    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const { success, message } = await login({ email, password });
    setIsSubmitting(false);

    if (!success) {
      setFormError(message);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-260px)] max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden lg:block">
        <p className="eyebrow">ByteLink</p>
        <h1 className="mt-4 text-5xl font-bold tracking-normal text-slate-950">Welcome Back</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
          Sign in to manage your links, QR codes, bulk uploads, and analytics dashboard.
        </p>
      </section>

      <section className="surface-card mx-auto w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-bold text-white">B</div>
          <h2 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">Enter your credentials to access your dashboard.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label-text" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" autoComplete="email" required />
          </div>

          <div>
            <label className="label-text" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" autoComplete="current-password" required />
          </div>

          {(formError || authError) && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError || authError}</div>}

          <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:bg-slate-400">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to ByteLink?{' '}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" to="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
