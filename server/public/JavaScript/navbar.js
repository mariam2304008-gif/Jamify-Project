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
    homeLink.innerHTML = '<a href="/">Home</a>';
    navLinksList.appendChild(homeLink);

    if (isAdmin) {
        // Admin navigation
        const adminReviewLink = document.createElement('li');
        adminReviewLink.innerHTML = '<a href="/reviewadmin">Admin Review</a>';
        navLinksList.appendChild(adminReviewLink);

        const adminsuggestionLink = document.createElement('li');
        adminsuggestionLink.innerHTML = '<a href="/admin/suggestions">Admin Suggestion</a>';
        navLinksList.appendChild(adminsuggestionLink);

        const profileLink = document.createElement('li');
        profileLink.innerHTML = '<a href="/profile">Profile</a>';
        navLinksList.appendChild(profileLink);

        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = '<a href="/logout">Logout</a>';
        navLinksList.appendChild(logoutLink);
    } else {
        // Regular user navigation
        const suggestLink = document.createElement('li');
        suggestLink.innerHTML = '<a href="/suggest">Suggest</a>';
        navLinksList.appendChild(suggestLink);

        const profileLink = document.createElement('li');
        profileLink.innerHTML = '<a href="/profile">Profile</a>';
        navLinksList.appendChild(profileLink);

        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = '<a href="/logout">Logout</a>';
        navLinksList.appendChild(logoutLink);
    }

}

// Run on page load
document.addEventListener('DOMContentLoaded', setupNavbar);
