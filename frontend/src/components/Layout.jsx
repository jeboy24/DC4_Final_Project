import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/dashboard" className="brand">📚 BookLend</Link>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/books">Books</Link>
            <Link to="/borrowings">{isAdmin ? 'Borrowings' : 'My Borrowings'}</Link>
            {isAdmin && <Link to="/manage/books">Manage Books</Link>}
            {isAdmin && <Link to="/manage/categories">Categories</Link>}
            <span className="user-tag">
            {user.name} ({isAdmin ? 'Librarian' : 'Student'})
            </span>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}