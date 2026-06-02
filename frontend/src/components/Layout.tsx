import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">Maq<span className="navbar-accent">Hub</span></div>

        <div className="navbar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Painel
          </NavLink>
          <NavLink
            to="/devices"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Máquinas
          </NavLink>
          <NavLink
            to="/control"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Comando
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              Equipe
            </NavLink>
          )}
        </div>

        <div className="navbar-actions">
          <span className="navbar-badge">{user?.role}</span>
          <button className="btn btn-sm btn-danger" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
