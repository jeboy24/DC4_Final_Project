import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <span className="brand-icon">📚</span> BookLend
        </Link>

        <nav className="side-nav">
          <NavLink to="/dashboard" className="side-link">
            <span className="side-icon">🏠</span> Dashboard
          </NavLink>
          <NavLink to="/books" className="side-link">
            <span className="side-icon">📖</span> Books
          </NavLink>
          <NavLink to="/borrowings" className="side-link">
            <span className="side-icon">🔖</span>
            {isAdmin ? 'Borrowings' : 'My Borrowings'}
          </NavLink>
        </nav>

        <div className="side-foot">
          <div className="user-tag">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{isAdmin ? 'Librarian' : 'Student'}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
