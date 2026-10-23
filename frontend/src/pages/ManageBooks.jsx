import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Pagination from '../components/Pagination';

const EMPTY = { title: '', author: '', isbn: '', category_id: '', copies_available: 1 };

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ search: '', category_id: '' });
  const [filters, setFilters] = useState({ search: '', category_id: '' });
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Categories for the dropdowns
  useEffect(() => {
    api
      .get('/categories', { params: { all: 1 } })
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  // Books list
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
  }, [filters, page, reload]);

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

  const openAdd = () => {
    setEditing(null);
    setData(EMPTY);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category_id: book.category_id,
      copies_available: book.copies_available,
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const e = {};
    if (!data.title.trim()) e.title = 'Title is required.';
    if (!data.author.trim()) e.author = 'Author is required.';
    if (!data.isbn.trim()) e.isbn = 'ISBN is required.';
    if (!data.category_id) e.category_id = 'Please choose a category.';
    const copies = Number(data.copies_available);
    if (data.copies_available === '' || !Number.isInteger(copies) || copies < 0)
      e.copies_available = 'Copies must be a whole number, 0 or more.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    const payload = { ...data, copies_available: Number(data.copies_available) };
    try {
      if (editing) {
        await api.put(`/books/${editing.id}`, payload);
        setMessage('Book updated successfully.');
      } else {
        await api.post('/books', payload);
        setMessage('Book added successfully.');
      }
      setModalOpen(false);
      setReload((r) => r + 1);
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        setErrors(
          Object.fromEntries(Object.entries(serverErrors).map(([k, v]) => [k, v[0]]))
        );
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    const ok = window.confirm(
      `Delete "${book.title}"? Its borrowing history will also be removed. This cannot be undone.`
    );
    if (!ok) return;

    setMessage('');
    setError('');
    try {
      await api.delete(`/books/${book.id}`);
      setMessage('Book deleted.');
      if (books.length === 1 && page > 1) setPage(page - 1);
      setReload((r) => r + 1);
    } catch {
      setError('Could not delete the book.');
    }
  };

  return (
    <>
      <div className="page-head">
        <h2>Manage Books</h2>
        <button className="btn btn-blue" onClick={openAdd}>+ Add book</button>
      </div>

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
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Copies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn}</td>
                  <td>{b.category?.name}</td>
                  <td>{b.copies_available}</td>
                  <td className="actions">
                    <button className="btn btn-light btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPage={goToPage} />

      {modalOpen && (
        <Modal title={editing ? 'Edit book' : 'Add book'} onClose={closeModal}>
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && <div className="alert alert-error">{errors.general}</div>}

            <FormInput label="Title" name="title" value={data.title}
              onChange={handleChange} error={errors.title} />
            <FormInput label="Author" name="author" value={data.author}
              onChange={handleChange} error={errors.author} />
            <FormInput label="ISBN" name="isbn" value={data.isbn}
              onChange={handleChange} error={errors.isbn} />

            <div className="field">
              <label>Category</label>
              <select
                className={errors.category_id ? 'input error' : 'input'}
                name="category_id"
                value={data.category_id}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <small className="error-text">{errors.category_id}</small>}
            </div>

            <FormInput label="Copies available" type="number" min="0" name="copies_available"
              value={data.copies_available} onChange={handleChange}
              error={errors.copies_available} />

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-blue" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}