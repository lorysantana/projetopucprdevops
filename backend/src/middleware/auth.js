const { verifyToken } = require('../utils/jwt');

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token de autenticacao ausente.' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, name: payload.name, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalido ou expirado.' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado para o seu perfil.' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorize };
