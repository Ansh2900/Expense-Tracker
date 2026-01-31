// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

const API_URL = 'http://localhost:3000/api/auth';

// Toggle between Login and Register
showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';

    // Clear errors
    loginError.textContent = '';
    registerError.textContent = '';
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';

    // Clear errors
    loginError.textContent = '';
    registerError.textContent = '';
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const submitBtn = loginForm.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        } else {
            loginError.textContent = data.message;
        }
    } catch (err) {
        loginError.textContent = 'Something went wrong. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Handle Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const submitBtn = registerForm.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            showLoginBtn.click();
        } else {
            registerError.textContent = data.message;
        }
    } catch (err) {
        registerError.textContent = 'Something went wrong. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Redirect if already logged in
if (localStorage.getItem('token')) {
    window.location.href = '/dashboard';
}
