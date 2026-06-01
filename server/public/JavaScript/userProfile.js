document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    if (!userId) {
        window.location.href = 'index.html';
        return;
    }

    await loadPublicProfile(userId);
});

async function loadPublicProfile(userId) {
    try {
        const res = await fetch(`/api/users/${userId}/public`);
        const data = await res.json();

        if (!data.success) {
            document.querySelector('.main-content').innerHTML = '<p class="empty-msg">User not found.</p>';
            return;
        }

        const { user, reviews, playlists } = data.data;

        document.title = `${user.displayName || user.username} - Jamify`;
        document.getElementById('displayName').textContent = user.displayName || user.username;
        document.getElementById('displayUsername').textContent = '@' + user.username;
        document.getElementById('displayBio').textContent = user.phone ? `Phone: ${user.phone}` : '';

        if (user.profileImage) {
            document.getElementById('profileImg').src = user.profileImage;
        }

        document.getElementById('statReviews').textContent = `${reviews.length} Reviews`;
        document.getElementById('statPlaylists').textContent = `${playlists.length} Playlists`;

        renderReviews(reviews);
        renderPlaylists(playlists);

    } catch (err) {
        console.error(err);
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('user-reviews-container');
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="empty-msg">No reviews yet.</p>';
        return;
    }

    reviews.forEach(review => {
        const date = new Date(review.createdAt).toLocaleDateString();
        const albumImg = review.album?.image || 'Images/default-album.png';
        const albumTitle = review.album?.title || 'Unknown Album';
        const albumId = review.album?._id || '#';

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <a href="albumProfile.html?id=${albumId}"><img src="${albumImg}" alt="${albumTitle}"></a>
            <div class="review-text">
                <h3><a href="albumProfile.html?id=${albumId}">${albumTitle}</a></h3>
                <p class="rating">${getStars(review.rating)} ${review.rating}/5</p>
                <p>${review.comment}</p>
                <small>${date}</small>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderPlaylists(playlists) {
    const container = document.getElementById('user-playlists-container');
    if (!playlists || playlists.length === 0) {
        container.innerHTML = '<p class="empty-msg">No public playlists.</p>';
        return;
    }

    playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `
            <div class="playlist-info">
                <h3>${escapeHtml(pl.name)}</h3>
                <p class="playlist-desc">${escapeHtml(pl.description || '')}</p>
                <span class="playlist-meta">${pl.albums.length} album(s)</span>
            </div>
            <div class="playlist-albums">
                ${pl.albums.slice(0, 4).map(a => `
                    <a href="albumProfile.html?id=${a._id}">
                        <img src="${a.image || 'Images/default-album.png'}" alt="${escapeHtml(a.title)}">
                    </a>
                `).join('')}
                ${pl.albums.length > 4 ? `<span class="more-albums">+${pl.albums.length - 4}</span>` : ''}
            </div>
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

function getStars(rating) {
    let html = '';
    for (let i = 0; i < 5; i++) html += i < rating ? '⭐' : '☆';
    return html;
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
}
