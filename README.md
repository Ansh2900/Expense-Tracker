# YOUR'S WALLET - Expense Tracker

A professional, full-stack expense tracking application designed for Semester 4 Software Engineering Technology students. This project demonstrates secure authentication, database management, RESTful APIs, and interactive data visualization.

## 🚀 Features

- **User Authentication**: Secure Login/Registration with BCrypt password hashing and JWT (JSON Web Tokens).
- **Transaction Management**: Add, View, and Delete income/expenses.
- **Visual Analytics**:
  - **Bar Chart**: Monthly Income vs. Expenses comparison.
  - **Pie Chart**: Expense breakdown by category.
- **Financial Summary**: Real-time calculation of total balance, income, and expenses.
- **Export Data**: One-click CSV export for external analysis.
- **Responsive Design**: Modern UI with glassmorphism effects, responsive for all devices.

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3 (Custom Design), JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL (using `mysql2` driver)
- **Security**: `bcryptjs` for hashing, `jsonwebtoken` for sessions, `cors` for API security.

## 📂 Project Structure

```
Expense Tracker/
├── config/             # Database configuration
├── controllers/        # Business logic (MVC Pattern)
├── database/           # SQL Schema files
├── middleware/         # Auth verification middleware
├── public/             # Static Frontend files (HTML, CSS, JS)
├── routes/             # API Route definitions
├── server.js           # Application entry point
└── .env                # Environment variables
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Node.js**: Installed on your machine.
- **MySQL Server**: You can use XAMPP, MySQL Workbench, or a Docker container.

### 2. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin if using XAMPP).
2. Create a new database named `expense_tracker_db`.
3. Import the `database/schema.sql` file.
   - Or copy the contents of `schema.sql` and run them in your SQL Query window.
   - This will create the `users`, `categories`, and `transactions` tables and seed default categories.

### 3. Application Setup
1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment:
   - Check the `.env` file.
   - If your MySQL password is not empty (default for XAMPP is empty), update `DB_PASS`.

### 4. Running the Project
Start the server:
```bash
npm start
```
- The server will run on `http://localhost:3000`.
- Open your browser and navigate to `http://localhost:3000`.

## 📚 API Documentation

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/transactions` | Get all transactions | Yes |
| POST | `/api/transactions` | Add a new transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete a transaction | Yes |
| GET | `/api/transactions/summary` | Get financial totals | Yes |
| GET | `/api/transactions/analytics` | Get chart data | Yes |

## 🎓 Design Decisions regarding Co-op

- **MVC Architecture**: Separated concerns for scalability and maintainability.
- **Security First**: Passwords are never stored in plain text. Routes are protected via Middleware.
- **Vanilla Frontend**: Demonstrates mastery of core web fundamentals without relying on heavy frameworks, a key skill for junior developers.

## 🔮 Future Improvements
- [ ] Add ability to create custom categories.
- [ ] Implement password reset functionality via email.
- [ ] Add dark/light mode toggle.
