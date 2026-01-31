const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/expense_tracker.db');

db.serialize(() => {
    // Delete existing admin if any
    db.run("DELETE FROM users WHERE username = 'admin' OR email = 'admin@pixelwallet.com'", (err) => {
        if (err) {
            console.error("Delete failed:", err);
        } else {
            console.log("Cleaned up old admin.");
        }
    });
});

db.close(() => {
    // After cleanup, we can register via API or just exit and let the next command do it
    console.log("Database connection closed.");
});
