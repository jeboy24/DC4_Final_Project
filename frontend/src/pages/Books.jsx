import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

export default function Books() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', category_id: '' });
  const [form, setForm] = useState({ search: '', category_id: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Load categories once (for the filter dropdown)
  useEffect(() => {
    api
      .get('/categories', { params: { all: 1 } })
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  // Load books whenever filters or page change
  useEffect(() => {
    let cancelled = false;
    api
      .get('/books', { params: { ...filters, page } })
      .then((res) => {
        if (cancelled) return;
        setBooks(res.data.data);
        setMeta(res.data.meta);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load books.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setFilters(form);
  };

  const handleClear = () => {
    const empty = { search: '', category_id: '' };
    setLoading(true);
    setForm(empty);
    setPage(1);
    setFilters(empty);
  };

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  const requestBook = async (book) => {
    setBusyId(book.id);
    setMessage('');
    setError('');
    try {
      await api.post('/borrow-records', { book_id: book.id });
      setMessage(`Request sent for "${book.title}". Wait for the librarian to approve it.`);
    } catch (err) {
      const msg = err.response?.data?.errors?.book_id?.[0];
      setError(msg || 'Could not send the request. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <h2>Books</h2>

      <form className="toolbar card" onSubmit={handleSearch}>
        <input
          className="input"
          placeholder="Search title, author, or ISBN"
          value={form.search}
          onChange={(e) => setForm({ ...form, search: e.target.value })}
        />
        <select
          className="input"
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-blue">Search</button>
        <button type="button" className="btn btn-light" onClick={handleClear}>Clear</button>
      </form>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="center">Loading books...</p>
      ) : books.length === 0 ? (
        <p className="center muted">No books found.</p>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div className="card book-card" key={book.id}>
              <span className="badge badge-category">{book.category?.name}</span>
              <h3>{book.title}</h3>
              <p className="muted">by {book.author}</p>
              <p className="muted">ISBN: {book.isbn}</p>
              <p>
                {book.copies_available > 0
                  ? `${book.copies_available} cop${book.copies_available === 1 ? 'y' : 'ies'} available`
                  : 'Not available'}
              </p>
              {!isAdmin && (
                <button
                  className="btn btn-blue"
                  disabled={book.copies_available < 1 || busyId === book.id}
                  onClick={() => requestBook(book)}
                >
                  {busyId === book.id ? 'Sending...' : 'Request this book'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPage={goToPage} />
    </>
  );
}