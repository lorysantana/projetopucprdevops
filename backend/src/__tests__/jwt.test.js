process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../utils/jwt');

describe('utils/jwt', () => {
  const user = { id: 1, name: 'Ana', role: 'admin' };

  test('signToken gera um token decodificavel com o payload esperado', () => {
    const token = signToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.sub).toBe(user.id);
    expect(decoded.name).toBe(user.name);
    expect(decoded.role).toBe(user.role);
  });

  test('verifyToken lanca erro para um token invalido', () => {
    expect(() => verifyToken('token-invalido')).toThrow();
  });
});
