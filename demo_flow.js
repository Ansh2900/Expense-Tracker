const http = require('http');

const BASE_URL = 'http://localhost:3000/api';
let TOKEN = '';
let USER_ID = '';
let TRAN_ID = '';

// Helper for requests
function request(method, endpoint, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) options.headers['Authorization'] = token;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runDemo() {
    console.log('🟢 --- STARTING AUTOMATED DEMO ---\n');

    const timestamp = Date.now();
    const headers = { 'Content-Type': 'application/json' };

    // 1. Test Password Validation (New Feature)
    console.log('1. 🧪 Testing Password Validation (Expect Failure)');
    const shortPassUser = {
        username: `user_${timestamp}`,
        email: `fail_${timestamp}@test.com`,
        password: '123'
    };
    let res = await request('POST', '/auth/register', shortPassUser);
    if (res.status === 400 && res.body.message.includes('at least 6 characters')) {
        console.log('   ✅ PASS: Rejected short password.');
    } else {
        console.log('   ❌ FAIL: ' + JSON.stringify(res.body));
    }
    console.log('');

    // 2. Successful Registration
    console.log('2. 👤 Registering Valid User');
    const validUser = {
        username: `demo_${timestamp}`,
        email: `demo_${timestamp}@test.com`,
        password: 'password123'
    };
    res = await request('POST', '/auth/register', validUser);
    if (res.status === 201) {
        console.log('   ✅ PASS: User Registered.');
    } else {
        console.log('   ❌ FAIL: ' + JSON.stringify(res.body));
    }
    console.log('');

    // 3. Login
    console.log('3. 🔐 Logging In');
    res = await request('POST', '/auth/login', { email: validUser.email, password: validUser.password });
    if (res.status === 200 && res.body.token) {
        TOKEN = res.body.token;
        console.log('   ✅ PASS: Login Successful. Token received.');
    } else {
        console.log('   ❌ FAIL: Login failed.');
        return;
    }
    console.log('');

    // 4. Test Transaction Validation (New Feature)
    console.log('4. 🧪 Testing Transaction Validation (Negative Amount)');
    const invalidTran = {
        description: 'Test Invalid',
        amount: -50,
        date: '2024-01-01',
        category_id: 1 // Salary
    };
    res = await request('POST', '/transactions', invalidTran, TOKEN);
    if (res.status === 400) {
        console.log('   ✅ PASS: Rejected negative amount.');
    } else {
        console.log('   ❌ FAIL: ' + JSON.stringify(res.body));
    }
    console.log('');

    // 5. Add Valid Transactions
    console.log('5. 💸 Adding Valid Transactions');

    // Income
    const income = { description: 'Job Salary', amount: 5000, date: '2024-01-01', category_id: 1 };
    res = await request('POST', '/transactions', income, TOKEN);
    console.log(`   Add Income: ${res.status === 201 ? 'OK' : 'FAIL'}`);

    // Expense
    const expense = { description: 'Rent', amount: 1200, date: '2024-01-05', category_id: 4 }; // Rent
    res = await request('POST', '/transactions', expense, TOKEN);
    console.log(`   Add Expense: ${res.status === 201 ? 'OK' : 'FAIL'}`);

    console.log('');

    // 6. Test Analytics (Critical SQLite Fix)
    console.log('6. 📊 Testing Analytics Endpoint (Fix Verification)');
    res = await request('GET', '/transactions/analytics', null, TOKEN);
    if (res.status === 200 && Array.isArray(res.body.barChart)) {
        console.log('   ✅ PASS: Analytics loaded successfully (Fix works!).');
        console.log(`   Found ${res.body.barChart.length} months of data.`);
        console.log(`   Data Sample: ${JSON.stringify(res.body.barChart[0])}`);
    } else {
        console.log('   ❌ FAIL: Analytics crashed or returned bad data.');
        console.log('   ' + JSON.stringify(res.body));
    }
    console.log('');

    // 7. List & Delete
    console.log('7. 🗑️  Testing List & Delete');
    res = await request('GET', '/transactions', null, TOKEN);
    const transactions = res.body;
    if (transactions.length > 0) {
        console.log(`   Found ${transactions.length} transactions.`);
        const idToDelete = transactions[0].id;

        res = await request('DELETE', `/transactions/${idToDelete}`, null, TOKEN);
        if (res.status === 200) {
            console.log(`   ✅ PASS: Deleted transaction ID ${idToDelete}`);
        } else {
            console.log('   ❌ FAIL: Could not delete.');
        }
    }
    console.log('\n--- DEMO COMPLETE ---');
}

runDemo();
