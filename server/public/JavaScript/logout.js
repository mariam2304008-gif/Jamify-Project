document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmLogout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    document.getElementById('cancelLogout').addEventListener('click', () => {
        window.history.back();
    });
});
