const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'client')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seedAdmin() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  if (count > 0) return;

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@empresa.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run('Administrador', email, passwordHash, 'admin');

  console.log(`[seed] usuario admin criado: ${email} / senha definida em SEED_ADMIN_PASSWORD`);
}

seedAdmin();

module.exports = db;
