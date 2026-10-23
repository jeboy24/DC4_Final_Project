import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const STATUS_LABEL = {
  requested: 'Requested',
  borrowed: 'Borrowed',
  returned: 'Returned',
};

export default function Borrowings() {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/borrow-records', { params: { status, page } })
      .then((res) => {
        if (cancelled) return;
        setRecords(res.data.data);
        setMeta(res.data.meta);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load borrowing records.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, page, reload]);

  const changeStatus = (value) => {
    setLoading(true);
    setPage(1);
    setStatus(value);
  };

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  // Runs an action, shows success or error, then reloads the list
  const run = async (id, action, successMsg) => {
    setBusyId(id);
    setMessage('');
    setError('');
    try {
      await action();
      setMessage(successMsg);
      setReload((r) => r + 1);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        errs
          ? Object.values(errs)[0][0]
          : err.response?.data?.message || 'Something went wrong.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const approve = (r) =>
    run(
      r.id,
      () => api.patch(`/borrow-records/${r.id}/status`, { status: 'borrowed' }),
      'Request approved. The book is now borrowed.'
    );

  const markReturned = (r) =>
    run(
      r.id,
      () => api.patch(`/borrow-records/${r.id}/status`, { status: 'returned' }),
      'Book marked as returned.'
    );

  const cancel = (r) => {
    if (!window.confirm('Cancel this request?')) return;
    run(r.id, () => api.delete(`/borrow-records/${r.id}`), 'Request cancelled.');
  };

  const payFine = (r) => {
    if (!window.confirm(`Mark the ₱${r.fine.amount} fine as paid?`)) return;
    run(r.id, () => api.patch(`/fines/${r.fine.id}/pay`), 'Fine marked as paid.');
  };

  return (
    <>
      <h2>{isAdmin ? 'All Borrowings' : 'My Borrowings'}</h2>

      <div className="toolbar card">
        <select
          className="input"
          value={status}
          onChange={(e) => changeStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="center">Loading...</p>
      ) : records.length === 0 ? (
        <p className="center muted">No records found.</p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                {isAdmin && <th>Student</th>}
                <th>Book</th>
                <th>Status</th>
                <th>Due date</th>
                <th>Returned</th>
                <th>Fine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  {isAdmin && <td>{r.user?.name}</td>}
                  <td>{r.book?.title}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                    {r.is_overdue && <span className="badge badge-overdue">Overdue</span>}
                  </td>
                  <td>{r.due_date || '-'}</td>
                  <td>{r.returned_at || '-'}</td>
                  <td>
                    {r.fine ? (
                      <>
                        ₱{r.fine.amount}{' '}
                        <span className={r.fine.is_paid ? 'badge badge-returned' : 'badge badge-overdue'}>
                          {r.fine.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="actions">
                    {isAdmin && r.status === 'requested' && (
                      <button className="btn btn-blue btn-sm" disabled={busyId === r.id} onClick={() => approve(r)}>
                        Approve
                      </button>
                    )}
                    {isAdmin && r.status === 'borrowed' && (
                      <button className="btn btn-blue btn-sm" disabled={busyId === r.id} onClick={() => markReturned(r)}>
                        Mark returned
                      </button>
                    )}
                    {isAdmin && r.fine && !r.fine.is_paid && (
                      <button className="btn btn-success btn-sm" disabled={busyId === r.id} onClick={() => payFine(r)}>
                        Mark paid
                      </button>
                    )}
                    {r.status === 'requested' && (
                      <button className="btn btn-danger btn-sm" disabled={busyId === r.id} onClick={() => cancel(r)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPage={goToPage} />
    </>
  );
}