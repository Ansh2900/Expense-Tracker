const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, '../database/expense_tracker.db');

// Create/Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

// Helper to wrap sqlite functions in promises (to match existing mysql interface)
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        // SQLite doesn't support ? placeholders in the same way for all queries, but we'll try to adapt
        // or just accept standard sqlite syntax.
        // Convert 'INSERT ...' to run(), 'SELECT ...' to all()

        const method = sql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';

        db[method](sql, params, function (err, rows) {
            if (err) reject(err);
            else {
                // For run(), 'this' contains lastID and changes
                if (method === 'run') resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
                else resolve([rows]); // Return as [rows] to match mysql2 format [rows, fields]
            }
        });
    });
};

// Initialize Tables if they don't exist
function initDb() {
    const userTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

    const categoryTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL, -- 'income' or 'expense'
        color TEXT DEFAULT '#3498db'
    )`;

    const transactionTable = `
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        transaction_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )`;

    const seedCategories = [
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Salary', 'income', '#2ecc71')`,
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Freelance', 'income', '#27ae60')`,
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Rent', 'expense', '#e74c3c')`,
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Groceries', 'expense', '#e67e22')`,
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Utilities', 'expense', '#f1c40f')`,
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Transportation', 'expense', '#3498db')`,
        `INSERT OR IGNORE INTO categories (name, type, color) VALUES ('Entertainment', 'expense', '#9b59b6')`
    ];

    db.serialize(() => {
        db.run(userTable);
        db.run(categoryTable);
        db.run(transactionTable);
        seedCategories.forEach(q => db.run(q));
    });
}

module.exports = { query };
