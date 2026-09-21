import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUser, createUser, updateUser } from '../services/api';
import Layout from '../components/Layout';
import './UsersList.css';

function UserForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', senha: '', role: 'client' });
  const [error, setError] = useState('');
  const [lastResponse, setLastResponse] = useState(null);

  useEffect(() => {
    if (!isEditing) return;

    getUser(token, id)
      .then((response) => {
        setForm({ name: response.data.name, email: response.data.email, senha: '', role: response.data.role });
        setLastResponse(response);
      })
      .catch((err) => {
        setError(err.message);
        setLastResponse({ status: err.status, data: err.data });
      });
  }, [id, isEditing, token]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { name: form.name, email: form.email, role: form.role };
    if (form.senha) payload.senha = form.senha;

    try {
      const response = isEditing
        ? await updateUser(token, id, payload)
        : await createUser(token, { ...payload, senha: form.senha });

      setLastResponse(response);
      navigate('/usuarios');
    } catch (err) {
      setError(err.message);
      setLastResponse({ status: err.status, data: err.data });
    }
  };

  const canChangeRole = user.role === 'admin';

  return (
    <Layout>
      <div className="users-list">
        <h1>{isEditing ? 'Editar usuário' : 'Novo usuário'}</h1>

        {error && <p className="error-label">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" value={form.name} onChange={handleChange('name')} required />
          </div>

          <div className="input-group">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={handleChange('email')} required />
          </div>

          <div className="input-group">
            <label>{isEditing ? 'Nova senha (opcional)' : 'Senha'}</label>
            <input
              type="password"
              value={form.senha}
              onChange={handleChange('senha')}
              required={!isEditing}
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label>Perfil</label>
            <select value={form.role} onChange={handleChange('role')} disabled={!canChangeRole}>
              <option value="admin">Administrador</option>
              <option value="operator">Operador</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <button type="submit">Salvar</button>
          <button type="button" onClick={() => navigate('/usuarios')}>
            Cancelar
          </button>
        </form>

        <section className="raw-response">
          <h2>Última resposta da API</h2>
          <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
        </section>
      </div>
    </Layout>
  );
}

export default UserForm;
