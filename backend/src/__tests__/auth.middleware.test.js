process.env.JWT_SECRET = 'test-secret';

const { signToken } = require('../utils/jwt');
const { authenticateToken, authorize } = require('../middleware/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('middleware/auth', () => {
  test('authenticateToken retorna 401 quando nao ha header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('authenticateToken chama next() e popula req.user com token valido', () => {
    const token = signToken({ id: 5, name: 'Bruno', role: 'operator' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 5, name: 'Bruno', role: 'operator' });
  });

  test('authorize bloqueia com 403 quando o papel do usuario nao e permitido', () => {
    const req = { user: { id: 1, name: 'Carla', role: 'client' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('admin', 'operator')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
