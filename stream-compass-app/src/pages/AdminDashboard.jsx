import { useEffect, useState } from 'react';
import { api, ApiError, API_BASE } from '../api.js';
import { navigate } from '../App.jsx';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .adminListPaid()
      .then(({ students: list }) => {
        setStudents(list);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('#/admin');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Could not load the list.');
        setLoading(false);
      });
  }, []);

  async function handleLogout() {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    navigate('#/admin');
  }

  return (
    <div className="sc-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p className="sc-eyebrow">Stream Selection</p>
          <h2 className="sc-title" style={{ margin: 0 }}>Paid students</h2>
        </div>
        <button type="button" className="sc-btn sc-btn-secondary" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {loading && (
        <div className="sc-center">
          <div className="sc-spinner" />
        </div>
      )}

      {error && <p className="sc-error">{error}</p>}

      {!loading && !error && students.length === 0 && <p className="sc-lede">No payments yet.</p>}

      {!loading && students.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="sc-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Grade / City</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.studentName}</td>
                  <td>
                    {s.email}
                    <br />
                    {s.phone}
                  </td>
                  <td>
                    {s.grade || '—'} / {s.city || '—'}
                  </td>
                  <td>
                    ₹{(s.amountPaise / 100).toFixed(0)}
                    <br />
                    <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>{formatDate(s.paidAt)}</span>
                  </td>
                  <td>{s.status}</td>
                  <td>{s.primaryStreamCode || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
