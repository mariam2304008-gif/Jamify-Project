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

function getUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isvalidpassword(password) {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function isUsernameTaken(username) {
    return getUsers().some(user => user.username.toLowerCase() === username.toLowerCase());
}

function validateSignup() {
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('reg-pass').value;
    const confirmPassword = document.getElementById('reg-confirm').value;

    const errorMessage = document.getElementById('signup-error-message');
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    if (name === '') {
        errorMessage.textContent = 'Please enter your display name';
        errorMessage.style.display = 'block';
        return;
    }

    if (username === '') {
        errorMessage.textContent = 'Please enter a username';
        errorMessage.style.display = 'block';
        return;
    }

    if (username.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase()) {
        errorMessage.textContent = "The username 'admin' is reserved. Please choose another username.";
        errorMessage.style.display = 'block';
        return;
    }

    if (isUsernameTaken(username)) {
        errorMessage.textContent = 'That username is already taken. Please choose another one.';
        errorMessage.style.display = 'block';
        return;
    }

    if (!isValidEmail(email)) {
        errorMessage.textContent = 'Please enter a valid email address';
        errorMessage.style.display = 'block';
        return;
    }

    if (password === '' || password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match or are empty';
        errorMessage.style.display = 'block';
        return;
    }

    if (!isvalidpassword(password)) {
        errorMessage.textContent = 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long.';
        errorMessage.style.display = 'block';
        return;
    }

    const newUser = {
        name,
        username,
        email,
        phone,
        password
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    alert('Account created successfully!');
    window.location.href = 'index.html';
}

function loginAction() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    const errorMessage = document.getElementById('login-error-message');
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    if (username === '' || password === '') {
        errorMessage.textContent = 'Please enter both username and password';
        errorMessage.style.display = 'block';
        return;
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username, role: 'admin' }));
        window.location.href = 'index.html';
        return;
    }

    const users = getUsers();
    const user = users.find(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password);

    if (!user) {
        errorMessage.textContent = 'Invalid username or password';
        errorMessage.style.display = 'block';
        return;
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    alert('Login successful!');
    window.location.href = 'index.html';
}
