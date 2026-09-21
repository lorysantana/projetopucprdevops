import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAcessar = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      await login(email, senha);
      navigate('/usuarios');
    } catch (err) {
      setMensagem(err.message || 'Usuário ou senha incorretos!');
    }
  };

  return (
    <div className="container">
      <img
        src="https://cdn-icons-png.flaticon.com/512/508/508759.png"
        alt="Ícone de segurança"
        className="login-icon"
      />

      <h1>Login</h1>

      <form onSubmit={handleAcessar}>
        <div className="input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
          />
        </div>

        <button type="submit">Acessar</button>
      </form>

      {mensagem && <p className="mensagem-label">{mensagem}</p>}
    </div>
  );
}

export default Login;
