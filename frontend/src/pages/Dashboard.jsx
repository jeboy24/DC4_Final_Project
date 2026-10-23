import { useEffect, useState } from 'react';
import api from '../api/axios';

const LABELS = {
  total_books: 'Total books',
  total_categories: 'Categories',
  pending_requests: 'Pending requests',
  currently_borrowed: 'Currently borrowed',
  overdue: 'Overdue',
  returned_this_week: 'Returned this week',
  unpaid_fines_total: 'Unpaid fines (₱)',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load the dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center">Loading dashboard...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const entries = Object.entries(stats).filter(([key]) => key !== 'role');

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        {entries.map(([key, value]) => (
          <div className="card stat" key={key}>
            <span className="stat-label">{LABELS[key] || key}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
    </>
  );
}