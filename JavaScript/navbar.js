// Navbar Management Utility
function setupNavbar() {
    const CURRENT_USER_KEY = 'user';
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    const user = userJson ? JSON.parse(userJson) : null;
    const isAdmin = user && user.role === 'admin';

    // Find all nav-links lists
    const navLinksList = document.querySelector('.nav-links');
    if (!navLinksList) return;

    // Clear existing nav links
    navLinksList.innerHTML = '';

    // Always show Home
    const homeLink = document.createElement('li');
    homeLink.innerHTML = '<a href="../HTML/index.html">Home</a>';
    navLinksList.appendChild(homeLink);

    if (isAdmin) {
        // Admin navigation
        const adminReviewLink = document.createElement('li');
        adminReviewLink.innerHTML = '<a href="../HTML/adminreview.html">Admin Review</a>';
        navLinksList.appendChild(adminReviewLink);

        const profileLink = document.createElement('li');
        profileLink.innerHTML = '<a href="../HTML/profile.html">Profile</a>';
        navLinksList.appendChild(profileLink);

        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = '<a href="../HTML/logout.html">Logout</a>';
        navLinksList.appendChild(logoutLink);
    } else {
        // Regular user navigation
        const suggestLink = document.createElement('li');
        suggestLink.innerHTML = '<a href="../HTML/suggest.html">Suggest</a>';
        navLinksList.appendChild(suggestLink);

        const profileLink = document.createElement('li');
        profileLink.innerHTML = '<a href="../HTML/profile.html">Profile</a>';
        navLinksList.appendChild(profileLink);

        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = '<a href="../HTML/logout.html">Logout</a>';
        navLinksList.appendChild(logoutLink);
    }

    // Highlight current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', setupNavbar);
