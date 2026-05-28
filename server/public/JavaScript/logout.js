document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmLogout').addEventListener('click', () => {
        window.location.href = '/api/logout';
    });

    document.getElementById('cancelLogout').addEventListener('click', () => {
        window.history.back();
    });
});
