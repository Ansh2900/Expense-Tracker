const db = require('../config/db');

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(`
            SELECT t.id, t.amount, t.description, t.transaction_date, c.name as category, c.type, c.color
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
            ORDER BY t.transaction_date DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// Add a transaction
exports.addTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, description, category_id, date } = req.body;

        if (!amount || !category_id || !date) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        await db.query(
            'INSERT INTO transactions (user_id, category_id, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?)',
            [userId, category_id, amount, description, date]
        );

        res.status(201).json({ message: 'Transaction added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding transaction' });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;

        const [result] = await db.query(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?',
            [transactionId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};

// Get Categories
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

// Get Monthly Summary
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        // Simple summary: Total Income, Total Expense
        const [rows] = await db.query(`
            SELECT 
                SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as total_income,
                SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as total_expense
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
        `, [userId]);

        const summary = rows[0];
        const balance = (summary.total_income || 0) - (summary.total_expense || 0);

        res.json({
            income: summary.total_income || 0,
            expense: summary.total_expense || 0,
            balance: balance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summary' });
    }
};

// Get Chart Data (Analytics)
exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Expense Breakdown by Category
        const [categoryData] = await db.query(`
            SELECT c.name, SUM(t.amount) as total, c.color
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ? AND c.type = 'expense'
            GROUP BY c.id
        `, [userId]);

        // 2. Monthly Income vs Expense (Last 6 months)
        // Note: Simplified for basic student project - grouping by month/year string
        const [monthlyData] = await db.query(`
            SELECT 
                strftime('%Y-%m', t.transaction_date) as month,
                SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as income,
                SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as expense
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `, [userId]);

        res.json({
            pieChart: categoryData,
            barChart: monthlyData.reverse() // Show oldest to newest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};
