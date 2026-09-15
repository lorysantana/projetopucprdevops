import { useState } from 'react';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const usuariosCadastrados = [
    { 
      id: 1, 
      email: 'lorysantana@pucpr.br', 
      senha: '1234567' 
    }
  ];

  const handleAcessar = (e) => {
    e.preventDefault();

    const usuarioValido = usuariosCadastrados.find(
      (user) => user.email === email && user.senha === senha
    );

    if (usuarioValido) {
      setMensagem('Acessado com sucesso!');
    } else {
      setMensagem('Usuário ou senha incorretos!');
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