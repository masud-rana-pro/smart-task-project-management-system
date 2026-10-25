import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
import { Alert, Loading } from '../components/ui';

const schema = z.object({
  name: z.string().trim().max(120),
  email: z.email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(128),
});
type Fields = z.infer<typeof schema>;
export default function AuthPage({
  register: registration = false,
}: {
  register?: boolean;
}) {
  const {
    user,
    pending,
    error: sessionError,
    expired,
    refresh,
    signIn,
  } = useSession();
  const [error, setError] = useState<unknown>(null);
  const [registered, setRegistered] = useState(false);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });
  if (pending) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  async function submit(data: Fields) {
    setError(null);
    if (registration) {
      if (!data.name.trim()) {
        setFieldError('name', { message: 'Enter your name.' });
        return;
      }
      if (data.password.length < 12) {
        setFieldError('password', { message: 'Use at least 12 characters.' });
        return;
      }
      try {
        await api('/auth/register', 'POST', data);
        setRegistered(true);
      } catch (failure) {
        setError(failure);
      }
    } else {
      try {
        await signIn(data.email, data.password);
      } catch (failure) {
        setError(failure);
      }
    }
  }
  return (
    <main id="main" tabIndex={-1} className="auth-layout">
      <section className="auth-story">
        <Link to="/login" className="brand">
          <span className="brand-mark">
            st<span>•</span>
          </span>
          smart task<span className="brand-dot">.</span>
        </Link>
        <div>
          <p className="eyebrow">A little clarity. A lot of progress.</p>
          <h1>
            Good work starts
            <br />
            with a clear plan.
          </h1>
          <p>
            Bring your projects, people and next steps together. Make room for
            the work that matters.
          </p>
          <div className="story-preview" aria-hidden="true">
            <div className="preview-heading">
              <span>Website launch</span>
              <span className="badge completed">On track</span>
            </div>
            <div className="preview-task">
              <span className="check-circle">✓</span>
              <span>Bring the team together</span>
            </div>
            <div className="preview-task">
              <span className="check-circle">✓</span>
              <span>Turn a plan into progress</span>
            </div>
            <div className="preview-task">
              <span className="open-circle" />
              <span>Make the next move</span>
            </div>
            <div className="progress-track">
              <span style={{ width: '67%' }} />
            </div>
            <small>Every step counts.</small>
          </div>
        </div>
        <p className="story-footer">
          One workspace. A shared sense of direction.
        </p>
      </section>
      <section className="auth-content">
        <div className="auth-card">
          <p className="eyebrow">Your workspace awaits</p>
          <h2>{registration ? 'Create your account' : 'Welcome back'}</h2>
          <p className="muted">
            {registration
              ? 'Join as a team member and start making progress.'
              : 'Sign in to pick up where you left off.'}
          </p>
          {expired && (
            <p className="info" role="status">
              Your session expired. Please sign in again.
            </p>
          )}
          {sessionError && (
            <>
              <Alert error={sessionError} />
              <button className="secondary" onClick={refresh}>
                Retry connection
              </button>
            </>
          )}
          {registered ? (
            <div className="success" role="status">
              <h3>You’re ready to join in.</h3>
              <p>Your team member account has been created.</p>
              <Link className="button" to="/login">
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submit)} noValidate>
              {registration && (
                <label>
                  Full name
                  <input
                    {...register('name')}
                    autoComplete="name"
                    maxLength={120}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <span className="field-error">{errors.name.message}</span>
                  )}
                </label>
              )}
              <label>
                Email address
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <span className="field-error">{errors.email.message}</span>
                )}
              </label>
              <label>
                Password
                <input
                  {...register('password')}
                  aria-label="Password"
                  type="password"
                  autoComplete={
                    registration ? 'new-password' : 'current-password'
                  }
                  maxLength={128}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <span className="field-error">{errors.password.message}</span>
                )}
                {registration && (
                  <span className="field-hint">
                    At least 12 characters. A long, unique passphrase works
                    well.
                  </span>
                )}
              </label>
              <Alert error={error} />
              <button className="full-width" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Please wait…'
                  : registration
                    ? 'Create account'
                    : 'Sign in to workspace'}
              </button>
            </form>
          )}
          <p className="auth-switch">
            {registration ? 'Already have an account?' : 'New to Smart Task?'}{' '}
            <Link to={registration ? '/login' : '/register'}>
              {registration ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <p className="auth-note">
            A shared workspace. Clear permissions. Better teamwork.
          </p>
        </div>
      </section>
    </main>
  );
}
