const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// Resolve path for database file
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new DatabaseSync(dbPath);

// Enable foreign key support
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    face_descriptor TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Adicionar coluna face_descriptor para usuários existentes (migração segura)
try {
  db.exec('ALTER TABLE users ADD COLUMN face_descriptor TEXT DEFAULT NULL;');
} catch (e) {
  // Coluna já existe — ignorar erro com segurança
}

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    project_name TEXT,
    project_value REAL NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

console.log('Database initialized successfully at:', dbPath);

module.exports = db;
