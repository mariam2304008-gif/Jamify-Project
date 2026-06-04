function initNavbarStateCrossfade() {
    const masterNav = document.querySelector('.navbar-master-container');
    if (!masterNav) return;

    // Highlight active paths on both horizontal and vertical links
    const allLinks = masterNav.querySelectorAll('a');
    const currentPath = window.location.pathname;

    allLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Toggle states cleanly based on vertical scroll boundary height
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            masterNav.classList.add('state-scrolled');
        } else {
            masterNav.classList.remove('state-scrolled');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbarStateCrossfade);
} else {
    initNavbarStateCrossfade();
}