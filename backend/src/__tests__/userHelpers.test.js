const { toPublicUser, isValidEmail } = require('../utils/userHelpers');

describe('utils/userHelpers', () => {
  test('isValidEmail aceita enderecos de email validos', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@empresa.com.br')).toBe(true);
  });

  test('isValidEmail rejeita enderecos de email invalidos', () => {
    expect(isValidEmail('sem-arroba.com')).toBe(false);
    expect(isValidEmail('user@sem-dominio')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('toPublicUser remove o password_hash do objeto retornado', () => {
    const row = { id: 1, name: 'Ana', email: 'ana@empresa.com', password_hash: 'hash-secreto', role: 'admin' };

    const result = toPublicUser(row);

    expect(result).not.toHaveProperty('password_hash');
    expect(result).toEqual({ id: 1, name: 'Ana', email: 'ana@empresa.com', role: 'admin' });
  });

  test('toPublicUser retorna null quando recebe um valor nulo', () => {
    expect(toPublicUser(null)).toBeNull();
  });
});
