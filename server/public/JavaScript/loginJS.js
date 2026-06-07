const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'Admin123'
};
const USERS_KEY = 'jamifyUsers';
const CURRENT_USER_KEY = 'user';

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    // Min 8 chars, at least 1 uppercase, 1 digit, 1 special character
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password);
}

// ── Signup ────────────────────────────────────────────────────────────────────

async function handleSignup(event) {
    event.preventDefault();

    const displayName = document.getElementById('reg-name').value.trim();
    const username    = document.getElementById('reg-user').value.trim();
    const email       = document.getElementById('reg-email').value.trim();
    const password    = document.getElementById('reg-pass').value;
    const confirm     = document.getElementById('reg-confirm').value;

    // Client-side validation with toast notifications
    if (displayName === '') {
        return showToast('Please enter your display name.', 'error');
    }
    if (username === '') {
        return showToast('Please enter a username.', 'error');
    }
    if (!isValidEmail(email)) {
        return showToast('Please enter a valid email address.', 'error');
    }
    if (password === '') {
        return showToast('Please enter a password.', 'error');
    }
    if (password.length < 8) {
        return showToast('Password must be at least 8 characters long.', 'error');
    }
    if (!/[A-Z]/.test(password)) {
        return showToast('Password must include at least one uppercase letter.', 'error');
    }
    if (!/\d/.test(password)) {
        return showToast('Password must include at least one number.', 'error');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return showToast('Password must include at least one special character (e.g. !@#$%).', 'error');
    }
    if (password !== confirm) {
        return showToast('Passwords do not match.', 'error');
    }

    // Send to authController via fetch
    try {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, displayName })
        });

        const data = await res.json();

        if (!res.ok) {
            return showToast(data.message || 'Signup failed. Please try again.', 'error');
        }

        showToast('Account created! Redirecting...', 'success');
        setTimeout(() => { window.location.href = '/login'; }, 1500);

    } catch (err) {
        showToast('Network error. Please try again.', 'error');
    }
}

// ── Login ─────────────────────────────────────────────────────────────────────

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    if (username === '' || password === '') {
        return showToast('Please enter both username and password.', 'error');
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.error === 'user_not_found') {
                return showToast('User does not exist.', 'error');
            }
            if (data.error === 'wrong_password') {
                return showToast('Wrong password.', 'error');
            }
            return showToast(data.message || 'Login failed. Please try again.', 'error');
        }

        // Success — server set the session, redirect home
        window.location.href = '/';

    } catch (err) {
        showToast('Network error. Please try again.', 'error');
    }
}
