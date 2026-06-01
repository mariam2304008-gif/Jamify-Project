document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get('id');

    if (!artistId) {
        window.location.href = 'index.html';
        return;
    }

    await loadArtistProfile(artistId);
});

async function loadArtistProfile(artistId) {
    try {
        const res = await fetch(`/api/artists/${artistId}`);
        const data = await res.json();

        if (!data.success) {
            document.querySelector('.main-content').innerHTML = '<p class="empty-msg">Artist not found.</p>';
            return;
        }

        const { artist, albums } = data.data;

        document.title = `${artist.name} - Jamify`;
        document.getElementById('artistName').textContent = artist.name;
        document.getElementById('artistBio').textContent = artist.bio || '';
        document.getElementById('artistGenre').textContent = artist.genre || '';
        document.getElementById('artistCountry').textContent = artist.country || '';

        if (artist.image) document.getElementById('artistImg').src = artist.image;

        if (artist.spotifyUrl) {
            document.getElementById('artistLinks').innerHTML = `
                <a href="${artist.spotifyUrl}" target="_blank" class="streaming-link spotify">
                    🎵 Spotify
                </a>
            `;
        }

        // Separate albums (more than 1 track) from singles (1 track or marked as single)
        const fullAlbums = albums.filter(a => !a.isSingle);
        const singles = albums.filter(a => a.isSingle);

        document.getElementById('statAlbums').textContent = `${fullAlbums.length} Albums`;
        document.getElementById('statSingles').textContent = `${singles.length} Singles`;

        renderAlbums(fullAlbums, 'albums-container');
        renderAlbums(singles, 'singles-container', true);

    } catch (err) {
        console.error(err);
    }
}

function renderAlbums(albums, containerId, isSingles = false) {
    const container = document.getElementById(containerId);

    if (!albums || albums.length === 0) {
        container.innerHTML = `<p class="empty-msg">No ${isSingles ? 'singles' : 'albums'} yet.</p>`;
        return;
    }

    albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <a href="albumProfile.html?id=${album._id}">
                <img src="${album.image || 'Images/default-album.png'}" alt="${escapeHtml(album.title)}">
                <div class="album-card-info">
                    <h4>${escapeHtml(album.title)}</h4>
                    <p>${album.releaseDate || ''}</p>
                    ${album.averageRating > 0 ? `<p class="rating">⭐ ${album.averageRating.toFixed(1)}</p>` : ''}
                </div>
            </a>
        `;
        container.appendChild(card);
    });
}

function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (btn) btn.classList.add('active');
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}
