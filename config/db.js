const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../agency.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    duration TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    budget REAL,
    deadline TEXT,
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS project_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

 CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agreements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    company TEXT,
    plan TEXT NOT NULL,
    revenue_percentage REAL DEFAULT 10,
    monthly_retainer REAL DEFAULT 0,
    signature TEXT NOT NULL,
    agreed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
  );
`);

console.log('✅ Database initialized');

module.exports = db;