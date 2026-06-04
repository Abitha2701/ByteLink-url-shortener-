import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    const { success, message } = await login({ email, password, rememberMe });
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
              A modern analytics-first URL shortener — designed for teams that care about performance, clarity, and control.
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

            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to manage your links, QR codes, and analytics dashboard.</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper auth-password-row">
                  <input
                    id="password"
                    className="auth-input password-input"
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle auth-toggle"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    onClick={() => setIsPasswordVisible((v) => !v)}
                  >
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {(formError || authError) && <div className="auth-error">{formError || authError}</div>}

              <div className="auth-row">
                <label className="auth-check">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember Me
                </label>
                <Link className="auth-link" to="#">
                  Forgot Password?
                </Link>
              </div>

            <button type="submit" disabled={isSubmitting} className="auth-gradient-btn auth-btn-solid">
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="auth-footer-link">
                New to ByteLink?{' '}
                <Link to="/signup">
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

