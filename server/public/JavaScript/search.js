
let currentFilter = 'all';
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            performSearch(input.value.trim());
        }, 300);
    });

    btn.addEventListener('click', () => {
        performSearch(input.value.trim());
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch(input.value.trim());
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn')
                .forEach(b => b.classList.remove('active'));

            btn.classList.add('active');

            currentFilter = btn.dataset.filter;

            performSearch(input.value.trim());
        });
    });

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
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>Start typing to search for users or artists.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Searching...</p>
        </div>
    `;

    try {
        let users = [];
        let artists = [];
        let albums = [];
        let songs = [];

        if (currentFilter === 'all' || currentFilter === 'users') {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (data.success) {
                users = data.data;
            }
        }

        if (currentFilter === 'all' || currentFilter === 'artists') {
            const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (data.success) {
                artists = data.data;
            }
        }
        if (currentFilter === 'all' || currentFilter === 'albums') {
    const res = await fetch(`/albums/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success) {
        albums = data.data;
    }
}
        if (currentFilter === 'all' || currentFilter === 'songs') {
    const res = await fetch(`/songs/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success) {
        songs = data.data;
    }
}

        renderResults(users, artists, albums, songs);

    } catch (err) {
        console.error(err);

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Something went wrong. Try again.</p>
            </div>
        `;
    }
}

function renderResults(users, artists, albums, songs) {
    const container = document.getElementById('search-results');

    container.innerHTML = '';

    if (users.length === 0 && artists.length === 0 && albums.length === 0 && songs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">😕</div>
                <p>No results found.</p>
                <span>Try another keyword.</span>
            </div>
        `;
        return;
    }

    // 🌟 UPDATE THIS SECTION IN YOUR search.js:
if (users.length > 0) {
    const section = document.createElement('div');
    section.className = 'results-section users';
    section.innerHTML = `
        <h3 class="results-title">👤 Users</h3>
    `;

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'result-card';

        card.innerHTML = `
            <a href="/api/users/${user._id}/public">
                <img 
                    src="${user.profileImageUrl || '/Images/album-profile-images/epic.png'}" 
                    alt="${escapeHtml(user.username)}"
                >

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

    section.className = 'results-section artists';

    section.innerHTML = `
        <h3 class="results-title">🎤 Artists</h3>
    `;

    artists.forEach(artist => {

        const card = document.createElement('div');

        card.className = 'result-card';

        card.innerHTML = `
            <a href="/artists/${artist._id}/profile">

                <img 
                    src="${artist.image || '/Images/default-album.png'}" 
                    alt="${escapeHtml(artist.name)}"
                >

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
    
    
    

if (songs.length > 0) {
    const section = document.createElement('div');

    section.className = 'results-section songs';

    section.innerHTML = `
        <h3 class="results-title">🎵 Songs</h3>
    `;

    songs.forEach(song => {
        const card = document.createElement('div');

        card.className = 'result-card';

        card.innerHTML = `
            <a href="/songs/${song._id}">
                <img 
                    src="${song.coverImageUrl || '/Images/album-profile-images/epic.png'}"
                    alt="${escapeHtml(song.title)}"
                >

                <div class="result-info">
                    <h4>${escapeHtml(song.title)}</h4>
                    <p>${escapeHtml(song.artist || '')}</p>
                </div>
            </a>
        `;

        section.appendChild(card);
    });

    container.appendChild(section);
}
}
function escapeHtml(str) {
    const div = document.createElement('div');

    div.appendChild(document.createTextNode(str || ''));

    return div.innerHTML;
}
