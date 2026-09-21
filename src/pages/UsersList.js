import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listUsers, deleteUser } from '../services/api';
import Layout from '../components/Layout';
import './UsersList.css';

function UsersList() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [lastResponse, setLastResponse] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const response = await listUsers(token);
      setUsers(response.data);
      setLastResponse(response);
      setError('');
    } catch (err) {
      setError(err.message);
      setLastResponse({ status: err.status, data: err.data });
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirma a exclusao deste usuario?')) return;

    try {
      const response = await deleteUser(token, id);
      setLastResponse(response);
      await loadUsers();
    } catch (err) {
      setError(err.message);
      setLastResponse({ status: err.status, data: err.data });
    }
  };

  return (
    <Layout>
      <div className="users-list">
        <div className="users-list-header">
          <h1>Usuários</h1>
          {user.role === 'admin' && (
            <button type="button" onClick={() => navigate('/usuarios/novo')}>
              Novo usuário
            </button>
          )}
        </div>

        {error && <p className="error-label">{error}</p>}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {(user.role === 'admin' || user.role === 'operator' || user.id === u.id) && (
                    <Link to={`/usuarios/${u.id}/editar`}>Editar</Link>
                  )}
                  {user.role === 'admin' && (
                    <button type="button" onClick={() => handleDelete(u.id)}>
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="raw-response">
          <h2>Última resposta da API</h2>
          <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
        </section>
      </div>
    </Layout>
  );
}

export default UsersList;
