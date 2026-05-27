// ─── State ────────────────────────────────────────────────────────────────────
let currentUserProfile = null;
let editingPlaylistId = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadProfile(token);
    await loadPlaylists(token);
    bindEditProfile();
    bindPlaylistModal(token);
});

// ─── Profile ──────────────────────────────────────────────────────────────────
async function loadProfile(token) {
    try {
        const res = await fetch('/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            const { user, reviews } = data.data;
            currentUserProfile = user;

            document.getElementById('displayName').textContent = user.displayName || user.username;
            document.getElementById('displayUsername').textContent = '@' + user.username;
            document.getElementById('displayBio').textContent = user.phone ? `Phone: ${user.phone}` : 'No additional info';

            if (user.profileImage) {
                document.getElementById('profileImg').src = user.profileImage;
            }

            document.getElementById('statReviews').textContent = `${reviews.length} Reviews`;
            renderUserReviews(reviews);
        }
    } catch (err) {
        console.error('Error fetching profile:', err);
    }
}

function renderUserReviews(reviews) {
    const container = document.getElementById('user-reviews-container');
    if (!container) return;

    container.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="empty-msg">No reviews yet.</p>';
        return;
    }

    reviews.forEach(review => {
        const date = new Date(review.createdAt).toLocaleDateString();
        const albumImg = review.album && review.album.image ? review.album.image : 'Images/default-album.png';
        const albumTitle = review.album ? review.album.title : 'Unknown Album';
        const albumId = review.album ? review.album._id : '#';

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <a href="album.html?id=${albumId}"><img src="${albumImg}" alt="${albumTitle}"></a>
            <div class="review-text">
                <h3><a href="album.html?id=${albumId}">${albumTitle}</a></h3>
                <p class="rating">${getStarHTML(review.rating)} ${review.rating}/5</p>
                <p>${review.comment}</p>
                <small>${date}</small>
            </div>
        `;
        container.appendChild(card);
    });
}

function getStarHTML(rating) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += i < rating ? '⭐' : '☆';
    }
    return html;
}

// ─── Tab switching ────────────────────────────────────────────────────────────
function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (btn) btn.classList.add('active');
}

// ─── Edit Profile ─────────────────────────────────────────────────────────────
function bindEditProfile() {
    let originalName = '', originalBio = '';

    document.getElementById('editBtn').addEventListener('click', () => {
        originalName = document.getElementById('displayName').textContent;
        originalBio = document.getElementById('displayBio').textContent;

        ['displayName', 'displayBio'].forEach(id => {
            const el = document.getElementById(id);
            el.contentEditable = 'true';
            el.style.border = '1px dashed #e74c3c';
            el.style.padding = '4px';
        });

        document.getElementById('editButtons').style.display = 'block';
        document.getElementById('editBtn').style.display = 'none';
        document.getElementById('displayName').focus();
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        document.getElementById('displayName').textContent = originalName;
        document.getElementById('displayBio').textContent = originalBio;
        exitEditMode();
    });

    document.getElementById('saveBtn').addEventListener('click', async () => {
        const newName = document.getElementById('displayName').textContent.trim();
        const newBio = document.getElementById('displayBio').textContent.trim();

        if (!newName) { alert('Please enter a display name'); return; }

        let phone = currentUserProfile ? (currentUserProfile.phone || '') : '';
        if (newBio.startsWith('Phone:')) phone = newBio.replace('Phone:', '').trim();

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('displayName', newName);
        formData.append('phone', phone);

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                currentUserProfile = data.data;
                exitEditMode();
                alert('Profile updated successfully!');
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            alert('Server error while updating profile');
        }
    });
}

function exitEditMode() {
    ['displayName', 'displayBio'].forEach(id => {
        const el = document.getElementById(id);
        el.contentEditable = 'false';
        el.style.border = 'none';
        el.style.padding = '0';
    });
    document.getElementById('editButtons').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
}

// ─── Playlists ────────────────────────────────────────────────────────────────
async function loadPlaylists(token) {
    try {
        const res = await fetch('/api/users/playlists', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('statPlaylists').textContent = `${data.count} Playlists`;
            renderPlaylists(data.data);
        }
    } catch (err) {
        console.error('Error fetching playlists:', err);
    }
}

function renderPlaylists(playlists) {
    const container = document.getElementById('user-playlists-container');
    container.innerHTML = '';

    if (!playlists || playlists.length === 0) {
        container.innerHTML = '<p class="empty-msg">No playlists yet. Create one!</p>';
        return;
    }

    playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `
            <div class="playlist-info">
                <h3>${escapeHtml(pl.name)}</h3>
                <p class="playlist-desc">${escapeHtml(pl.description || '')}</p>
                <span class="playlist-meta">${pl.albums.length} album(s) · ${pl.isPublic ? 'Public' : 'Private'}</span>
            </div>
            <div class="playlist-albums">
                ${pl.albums.slice(0, 4).map(a => `
                    <a href="album.html?id=${a._id}" title="${escapeHtml(a.title)}">
                        <img src="${a.image || 'Images/default-album.png'}" alt="${escapeHtml(a.title)}">
                    </a>
                `).join('')}
                ${pl.albums.length > 4 ? `<span class="more-albums">+${pl.albums.length - 4}</span>` : ''}
            </div>
            <div class="playlist-actions">
                <button onclick="openEditPlaylist('${pl._id}', '${escapeHtml(pl.name)}', '${escapeHtml(pl.description || '')}', ${pl.isPublic})">Edit</button>
                <button class="btn-danger" onclick="deletePlaylist('${pl._id}')">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function bindPlaylistModal(token) {
    const modal = document.getElementById('playlistModal');

    document.getElementById('createPlaylistBtn').addEventListener('click', () => {
        editingPlaylistId = null;
        document.getElementById('modalTitle').textContent = 'Create Playlist';
        document.getElementById('playlistName').value = '';
        document.getElementById('playlistDesc').value = '';
        document.getElementById('playlistPublic').checked = true;
        modal.style.display = 'flex';
    });

    document.getElementById('cancelPlaylistBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    document.getElementById('savePlaylistBtn').addEventListener('click', async () => {
        const name = document.getElementById('playlistName').value.trim();
        const description = document.getElementById('playlistDesc').value.trim();
        const isPublic = document.getElementById('playlistPublic').checked;

        if (!name) { alert('Please enter a playlist name'); return; }

        const payload = { name, description, isPublic };
        const url = editingPlaylistId
            ? `/api/users/playlists/${editingPlaylistId}`
            : '/api/users/playlists';
        const method = editingPlaylistId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                modal.style.display = 'none';
                await loadPlaylists(token);
            } else {
                alert(data.error || 'Failed to save playlist');
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    });
}

function openEditPlaylist(id, name, description, isPublic) {
    editingPlaylistId = id;
    document.getElementById('modalTitle').textContent = 'Edit Playlist';
    document.getElementById('playlistName').value = name;
    document.getElementById('playlistDesc').value = description;
    document.getElementById('playlistPublic').checked = isPublic;
    document.getElementById('playlistModal').style.display = 'flex';
}

async function deletePlaylist(id) {
    if (!confirm('Delete this playlist?')) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/users/playlists/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            await loadPlaylists(token);
        } else {
            alert(data.error || 'Failed to delete playlist');
        }
    } catch (err) {
        console.error(err);
        alert('Server error');
    }
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
}
