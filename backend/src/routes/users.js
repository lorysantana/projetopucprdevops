const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, authorize } = require('../middleware/auth');
const { toPublicUser, isValidEmail } = require('../utils/userHelpers');

const router = express.Router();
const VALID_ROLES = ['admin', 'operator', 'client'];

router.use(authenticateToken);

// GET /api/users - admin e operator veem todos; client ve apenas o proprio registro
router.get('/', authorize('admin', 'operator', 'client'), (req, res) => {
  if (req.user.role === 'client') {
    const own = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    return res.status(200).json(own ? [toPublicUser(own)] : []);
  }

  const rows = db.prepare('SELECT * FROM users ORDER BY id').all();
  return res.status(200).json(rows.map(toPublicUser));
});

// GET /api/users/:id - admin/operator qualquer usuario; client apenas o proprio
router.get('/:id', authorize('admin', 'operator', 'client'), (req, res) => {
  const targetId = Number(req.params.id);

  if (req.user.role === 'client' && req.user.id !== targetId) {
    return res.status(403).json({ message: 'Voce so pode consultar seus proprios dados.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario nao encontrado.' });
  }

  return res.status(200).json(toPublicUser(user));
});

// POST /api/users - somente admin
router.post('/', authorize('admin'), (req, res) => {
  const { name, email, senha, role } = req.body || {};

  if (!name || !email || !senha || !role) {
    return res.status(400).json({ message: 'Informe nome, email, senha e perfil.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Email invalido.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter ao menos 6 caracteres.' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: `Perfil invalido. Use: ${VALID_ROLES.join(', ')}.` });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ message: 'Ja existe um usuario com este email.' });
  }

  const passwordHash = bcrypt.hashSync(senha, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email, passwordHash, role);

  const created = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(toPublicUser(created));
});

// PUT /api/users/:id - admin altera qualquer campo de qualquer usuario;
// operator altera nome/email de qualquer usuario, mas nao o perfil;
// client altera apenas os proprios dados, e nao pode trocar o proprio perfil
router.put('/:id', authorize('admin', 'operator', 'client'), (req, res) => {
  const targetId = Number(req.params.id);
  const { name, email, senha, role } = req.body || {};

  if (req.user.role === 'client' && req.user.id !== targetId) {
    return res.status(403).json({ message: 'Voce so pode atualizar seus proprios dados.' });
  }
  if (req.user.role !== 'admin' && role) {
    return res.status(403).json({ message: 'Apenas administradores podem alterar o perfil de acesso.' });
  }

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!existing) {
    return res.status(404).json({ message: 'Usuario nao encontrado.' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ message: 'Email invalido.' });
  }
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: `Perfil invalido. Use: ${VALID_ROLES.join(', ')}.` });
  }
  if (senha && senha.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter ao menos 6 caracteres.' });
  }

  const updated = {
    name: name || existing.name,
    email: email || existing.email,
    role: req.user.role === 'admin' && role ? role : existing.role,
    password_hash: senha ? bcrypt.hashSync(senha, 10) : existing.password_hash,
  };

  db.prepare(
    'UPDATE users SET name = ?, email = ?, role = ?, password_hash = ? WHERE id = ?'
  ).run(updated.name, updated.email, updated.role, updated.password_hash, targetId);

  const result = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  return res.status(200).json(toPublicUser(result));
});

// DELETE /api/users/:id - somente admin
router.delete('/:id', authorize('admin'), (req, res) => {
  const targetId = Number(req.params.id);
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);

  if (!existing) {
    return res.status(404).json({ message: 'Usuario nao encontrado.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  return res.status(204).send();
});

module.exports = router;
