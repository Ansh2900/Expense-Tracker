-- Database Schema for PixelWallet Expense Tracker

CREATE DATABASE IF NOT EXISTS expense_tracker_db;
USE expense_tracker_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table (Pre-populated for consistency)
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('income', 'expense') NOT NULL,
    color VARCHAR(20) DEFAULT '#3498db' -- For chart visuals
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Seed Initial Categories if not exist
INSERT IGNORE INTO categories (name, type, color) VALUES 
('Salary', 'income', '#2ecc71'),
('Freelance', 'income', '#27ae60'),
('Investments', 'income', '#16a085'),
('Rent', 'expense', '#e74c3c'),
('Groceries', 'expense', '#e67e22'),
('Utilities', 'expense', '#f1c40f'),
('Transportation', 'expense', '#3498db'),
('Entertainment', 'expense', '#9b59b6'),
('Health', 'expense', '#d35400'),
('Education', 'expense', '#8e44ad'),
('Other', 'expense', '#95a5a6');
