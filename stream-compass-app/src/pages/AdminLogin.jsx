import { useEffect, useState } from 'react';
import { api, ApiError } from '../api.js';
import { navigate } from '../App.jsx';

export default function AdminLogin() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .adminMe()
      .then((res) => {
        if (res.ok) navigate('#/admin/dashboard');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.adminLogin(email, password);
      navigate('#/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="sc-center">
        <div className="sc-spinner" />
      </div>
    );
  }

  return (
    <div className="sc-card" style={{ maxWidth: 380, margin: '40px auto' }}>
      <p className="sc-eyebrow">Admin</p>
      <h2 className="sc-title">Stream Selection — sign in</h2>
      <form onSubmit={handleSubmit}>
        <div className="sc-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="sc-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="sc-error">{error}</p>}
        <button type="submit" className="sc-btn sc-btn-block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
