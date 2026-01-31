const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
    window.location.href = '/';
}

document.getElementById('user-greeting').textContent = `Hello, ${user ? user.username : 'User'}`;

const API_BASE = 'http://localhost:3000/api/transactions';
let mainChart = null;
let pieChart = null;

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});

// Format Currency
const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
    fetchSummary();
    fetchTransactions();
    fetchCategories();
    fetchAnalytics();

    // Set default date to today
    document.getElementById('t-date').valueAsDate = new Date();
});

// Fetch Summary
async function fetchSummary() {
    try {
        const res = await fetch(`${API_BASE}/summary`, {
            headers: { 'Authorization': token }
        });
        const data = await res.json();

        document.getElementById('total-balance').textContent = formatMoney(data.balance);
        document.getElementById('total-income').textContent = formatMoney(data.income);
        document.getElementById('total-expense').textContent = formatMoney(data.expense);
    } catch (error) {
        console.error('Error fetching summary', error);
    }
}

// Fetch Transactions
async function fetchTransactions() {
    try {
        const res = await fetch(`${API_BASE}/`, {
            headers: { 'Authorization': token }
        });
        const data = await res.json();
        const tbody = document.getElementById('transactions-body');
        tbody.innerHTML = '';

        window.allTransactions = data; // Store for export

        data.forEach(t => {
            const tr = document.createElement('tr');
            const date = new Date(t.transaction_date).toLocaleDateString();
            const isIncome = t.type === 'income';

            tr.innerHTML = `
                <td>${date}</td>
                <td><span style="color: ${t.color}; font-weight: 500;">${t.category}</span></td>
                <td>${t.description || '-'}</td>
                <td style="color: ${isIncome ? 'var(--secondary-color)' : 'var(--text-primary)'}; font-weight: 600;">
                    ${isIncome ? '+' : '-'}${formatMoney(t.amount)}
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching transactions', error);
    }
}

// Add Transaction
document.getElementById('add-transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('t-description').value;
    const amount = document.getElementById('t-amount').value;
    const date = document.getElementById('t-date').value;
    const category_id = document.getElementById('t-category').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ description, amount, date, category_id })
        });

        if (res.ok) {
            // Reset form and reload data
            e.target.reset();
            document.getElementById('t-date').valueAsDate = new Date();
            refreshAll();
        } else {
            const data = await res.json();
            document.getElementById('add-error').textContent = data.message;
        }
    } catch (error) {
        console.error('Error adding transaction', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

// Delete Transaction
window.deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (res.ok) {
            refreshAll();
        }
    } catch (error) {
        console.error('Error deleting transaction', error);
    }
};

// Fetch Categories for Select
async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`, {
            headers: { 'Authorization': token }
        });
        const categories = await res.json();
        const select = document.getElementById('t-category');
        select.innerHTML = '<option value="" disabled selected>Select Category</option>';

        categories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.name} (${c.type})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories', error);
    }
}

// Fetch Analytics & Render Charts
async function fetchAnalytics() {
    try {
        const res = await fetch(`${API_BASE}/analytics`, {
            headers: { 'Authorization': token }
        });
        const data = await res.json();

        renderBarChart(data.barChart);
        renderPieChart(data.pieChart);
    } catch (error) {
        console.error('Error fetching analytics', error);
    }
}

function renderBarChart(data) {
    const ctx = document.getElementById('mainChart').getContext('2d');

    if (mainChart) mainChart.destroy();

    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.month),
            datasets: [
                {
                    label: 'Income',
                    data: data.map(d => d.income),
                    backgroundColor: '#10B981',
                    borderRadius: 5
                },
                {
                    label: 'Expense',
                    data: data.map(d => d.expense),
                    backgroundColor: '#EF4444',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

function renderPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.total),
                backgroundColor: data.map(d => d.color),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12 } }
            }
        }
    });
}

function refreshAll() {
    fetchSummary();
    fetchTransactions();
    fetchAnalytics();
}

// Export to CSV
document.getElementById('export-btn').addEventListener('click', () => {
    if (!window.allTransactions || window.allTransactions.length === 0) return alert('No transactions to export');

    const rows = [
        ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'],
        ...window.allTransactions.map(t => [
            t.id,
            t.transaction_date,
            t.type,
            `"${t.category}"`, // Escape category
            `"${(t.description || '').replace(/"/g, '""')}"`, // Escape description & handle quotes
            t.amount
        ])
    ];

    let csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
});
