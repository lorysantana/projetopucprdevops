import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <span>
          Logado como <strong>{user?.name}</strong> ({user?.role})
        </span>
        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <main className="layout-content">{children}</main>
    </div>
  );
}

export default Layout;
