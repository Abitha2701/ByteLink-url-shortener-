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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!acceptedTerms) {
      setFormError('Please accept the Terms & Conditions to continue.');
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
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-left hidden lg:block">
          <div className="auth-noise" />
          <div className="auth-float-shape s1" />
          <div className="auth-float-shape s2" />
          <div className="auth-float-shape s3" />

          <div>
            <p className="eyebrow" style={{ margin: 0 }}>
              ByteLink
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-normal" style={{ marginBottom: 8, color: '#0f172a' }}>
              Shorten. <br />
              <span className="auth-gradient-text">Track.</span> <br />
              <span className="auth-gradient-text">Grow.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-7" style={{ color: '#64748b' }}>
              From branded short links to real-time analytics — launch faster with a premium, team-ready workspace.
            </p>

            <div className="auth-left-copy">
              <h3 className="auth-left-heading">Real-time visibility for every link</h3>
              <p className="auth-left-paragraph">
                Create branded short links, track clicks instantly, and understand your audience in real time.
              </p>
            </div>




          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-avatar" aria-hidden="true">
              B
            </div>

            <h2 className="auth-title">Create Your Account</h2>
            <p className="auth-subtitle">Start building better links with a premium analytics experience.</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field auth-password-row">
                <label htmlFor="password">Password</label>
               <input
  id="confirmPassword"
  className="auth-input auth-password-input"
  type={isPasswordVisible ? 'text' : 'password'}
  value={confirmPassword}
  onChange={(event) => setConfirmPassword(event.target.value)}
  autoComplete="new-password"
  required
/>
                <button type="button" className="auth-toggle" onClick={() => setIsPasswordVisible((v) => !v)}>
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="auth-field auth-password-row">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  className="auth-input"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button type="button" className="auth-toggle" onClick={() => setIsPasswordVisible((v) => !v)}>
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>

              {(formError || authError) && <div className="auth-error">{formError || authError}</div>}

              <label className="auth-check" style={{ alignItems: 'flex-start', gap: 12 }}>
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                <span>
                  I agree to the <span style={{ color: '#0f172a', fontWeight: 900 }}>Terms &amp; Conditions</span>
                </span>
              </label>

              <button type="submit" disabled={isSubmitting} className="auth-gradient-btn auth-btn-solid">
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="auth-footer-link">
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

