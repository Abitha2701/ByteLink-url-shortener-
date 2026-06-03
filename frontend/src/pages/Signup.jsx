import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { user, signup, authError, setAuthError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setAuthError(null);

    if (!name || !email || !password || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }

    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { success, message } = await signup({ name, email, password });
    setIsSubmitting(false);

    if (!success) {
      setFormError(message);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-260px)] max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden lg:block">
        <p className="eyebrow">ByteLink</p>
        <h1 className="mt-4 text-5xl font-bold tracking-normal text-slate-950">Create Your Account</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
          Start saving short links, generating QR codes, and reading analytics from a focused workspace.
        </p>
      </section>

      <section className="surface-card mx-auto w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-bold text-white">B</div>
          <h2 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">Create Your Account</h2>
          <p className="mt-2 text-sm text-slate-600">Register to start managing ByteLinks.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label-text" htmlFor="name">
              Name
            </label>
            <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} className="form-input" autoComplete="name" required />
          </div>

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
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" autoComplete="new-password" required />
          </div>

          <div>
            <label className="label-text" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-input" autoComplete="new-password" required />
          </div>

          {(formError || authError) && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError || authError}</div>}

          <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:bg-slate-400">
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
