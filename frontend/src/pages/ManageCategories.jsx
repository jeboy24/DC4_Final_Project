import { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Pagination from '../components/Pagination';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/categories', { params: { page } })
      .then((res) => {
        if (cancelled) return;
        setCategories(res.data.data);
        setMeta(res.data.meta);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load categories.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, reload]);

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  const openAdd = () => {
    setEditing(null);
    setName('');
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Category name is required.' });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name });
        setMessage('Category updated successfully.');
      } else {
        await api.post('/categories', { name });
        setMessage('Category added successfully.');
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

  const handleDelete = async (cat) => {
    const warning =
      cat.books_count > 0
        ? `Delete "${cat.name}"? Its ${cat.books_count} book(s) will also be deleted. This cannot be undone.`
        : `Delete "${cat.name}"? This cannot be undone.`;
    if (!window.confirm(warning)) return;

    setMessage('');
    setError('');
    try {
      await api.delete(`/categories/${cat.id}`);
      setMessage('Category deleted.');
      if (categories.length === 1 && page > 1) setPage(page - 1);
      setReload((r) => r + 1);
    } catch {
      setError('Could not delete the category.');
    }
  };

  return (
    <>
      <div className="page-head">
        <h2>Manage Categories</h2>
        <button className="btn btn-blue" onClick={openAdd}>+ Add category</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="center">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="center muted">No categories yet.</p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Books</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.books_count}</td>
                  <td className="actions">
                    <button className="btn btn-light btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPage={goToPage} />

      {modalOpen && (
        <Modal title={editing ? 'Edit category' : 'Add category'} onClose={closeModal}>
          <form onSubmit={handleSubmit} noValidate>
            {errors.general && <div className="alert alert-error">{errors.general}</div>}

            <FormInput
              label="Category name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({});
              }}
              error={errors.name}
            />

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