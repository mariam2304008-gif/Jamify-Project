let currentFilter = 'all';
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');

    // Live search on typing
    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(input.value.trim());
        }, 400);
    });

    // Search on button click
    btn.addEventListener('click', () => {
        performSearch(input.value.trim());
    });

    // Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(input.value.trim());
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            performSearch(input.value.trim());
        });
    });

    // Check if there's a query in the URL
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        input.value = q;
        performSearch(q);
    }
});

async function performSearch(query) {
    const container = document.getElementById('search-results');

    if (!query) {
        container.innerHTML = '<p class="empty-msg">Start typing to search for users or artists.</p>';
        return;
    }

    container.innerHTML = '<p class="empty-msg">Searching...</p>';

    try {
        let users = [], artists = [];

        if (currentFilter === 'all' || currentFilter === 'users') {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) users = data.data;
        }

        if (currentFilter === 'all' || currentFilter === 'artists') {
            const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) artists = data.data;
        }

        renderResults(users, artists);

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="empty-msg">Something went wrong. Try again.</p>';
    }
}

function renderResults(users, artists) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';

    if (users.length === 0 && artists.length === 0) {
        container.innerHTML = '<p class="empty-msg">No results found.</p>';
        return;
    }

    if (users.length > 0) {
        const section = document.createElement('div');
        section.className = 'results-section';
        section.innerHTML = `<h3 class="results-title">👤 Users</h3>`;

        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <a href="userProfile.html?id=${user._id}">
                    <img src="${user.profileImage || 'Images/album-profile-images/epic.png'}" alt="${escapeHtml(user.username)}">
                    <div class="result-info">
                        <h4>${escapeHtml(user.displayName || user.username)}</h4>
                        <p>@${escapeHtml(user.username)}</p>
                    </div>
                </a>
            `;
            section.appendChild(card);
        });

        container.appendChild(section);
    }

    if (artists.length > 0) {
        const section = document.createElement('div');
        section.className = 'results-section';
        section.innerHTML = `<h3 class="results-title">🎤 Artists</h3>`;

        artists.forEach(artist => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <a href="artistProfile.html?id=${artist._id}">
                    <img src="${artist.image || 'Images/album-profile-images/epic.png'}" alt="${escapeHtml(artist.name)}">
                    <div class="result-info">
                        <h4>${escapeHtml(artist.name)}</h4>
                        <p>${escapeHtml(artist.genre || '')}</p>
                    </div>
                </a>
            `;
            section.appendChild(card);
        });

        container.appendChild(section);
    }
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}
