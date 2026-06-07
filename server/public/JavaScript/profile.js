// ─── State ────────────────────────────────────────────────────────────────────
let editingPlaylistId = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    bindEditProfile();
    bindPlaylistModal();
    loadUserPlaylists();
});

// ─── Tab Switching ────────────────────────────────────────────────────────────
function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (btn) btn.classList.add('active');

    if (tabId === 'playlists') {
        loadUserPlaylists();
    }
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

        if (!newName) { showToast('Please enter a display name', 'warning'); return; }

        // Fix: Pack fields into a standard JSON payload
        const payload = {
            displayName: newName,
            bio: newBio
        };

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json' // Crucial for Express to read req.body correctly
                },
                body: JSON.stringify(payload) 
            });
            const data = await res.json();

            if (data.success) {
                exitEditMode();
                showToast('Profile updated successfully!', 'success');
                window.location.reload(); 
            } else {
                showToast(data.error || 'Failed to update profile', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Server error while saving profile', 'error');
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

// ─── Playlists Management ─────────────────────────────────────────────────────
function bindPlaylistModal() {
    const modal = document.getElementById('playlistModal');

    document.getElementById('createPlaylistBtn').addEventListener('click', () => {
        editingPlaylistId = null;
        document.getElementById('modalTitle').textContent = 'Create Playlist';
        document.getElementById('playlistName').value = '';
        document.getElementById('playlistDesc').value = '';
        document.getElementById('playlistPublic').checked = true;
        modal.style.display = 'flex';
    });

    document.getElementById('cancelPlaylistBtn').addEventListener('click', () => { modal.style.display = 'none'; });

    document.getElementById('savePlaylistBtn').addEventListener('click', async () => {
        const name = document.getElementById('playlistName').value.trim();
        const description = document.getElementById('playlistDesc').value.trim();
        const isPublic = document.getElementById('playlistPublic').checked;

        if (!name) { showToast('Please enter a playlist name', 'warning'); return; }

        const payload = { name, description, isPublic };
        const url = editingPlaylistId ? `/api/users/playlists/${editingPlaylistId}` : '/api/users/playlists';
        const method = editingPlaylistId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                modal.style.display = 'none';
                window.location.reload(); 
            }
        } catch (err) {
            console.error(err);
            showToast('Error saving playlist.', 'error');
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

function deletePlaylist(id) {
    showConfirm('Delete this playlist?', async () => {
        try {
            const res = await fetch(`/api/users/playlists/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                showToast(data.message || 'Failed to delete.', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// ─── Social Collapsible Widget Engine ──────────────────────────────────────────
function toggleSocialExpansion(listId, buttonElement) {
    const listContainer = document.getElementById(listId);
    
    // Toggle structural state class
    listContainer.classList.toggle('expanded-state');
    
    // Evaluate current state to re-label text contents
    if (listContainer.classList.contains('expanded-state')) {
        buttonElement.textContent = "Show Less";
    } else {
        buttonElement.textContent = "Show More";
    }
}

// ─── Song Management in Playlists ──────────────────────────────────────────

async function openSongsModal(playlistId, playlistName) {
    const modal = document.getElementById('songsModal');
    const container = document.getElementById('songsListContainer');
    document.getElementById('songsModalTitle').textContent = playlistName;

    const deleteBtn = document.getElementById('deletePlaylistBtn');
    deleteBtn.onclick = () => deletePlaylist(playlistId);

    container.innerHTML = '<p style="color:#888; font-style:italic;">Loading...</p>';
    modal.style.display = 'flex';

    try {
        const res = await fetch(`/api/users/playlists/${playlistId}`, {
            credentials: 'include'
        });
        const result = await res.json();

        if (!result.success || !result.data) {
            container.innerHTML = '<p style="color:#e74c3c;">Error loading playlist.</p>';
            return;
        }

        const songs = result.data.songs || [];

        if (songs.length === 0) {
            container.innerHTML = '<p style="color:#888; font-style:italic;">No songs added.</p>';
            return;
        }

        container.innerHTML = '';
        songs.forEach(song => {
            const div = document.createElement('div');
            div.className = 'song-row';
            div.innerHTML = `
                <a href="/songs/${song._id}" style="display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit; flex:1;">
                    <img src="${song.coverImageUrl || '/Images/album-profile-images/epic.png'}"
                         style="width:44px; height:44px; border-radius:6px; object-fit:cover; flex-shrink:0;">
                    <div>
                        <div style="font-weight:600; font-size:14px;">${escapeHtml(song.title)}</div>
                        <div style="font-size:12px; color:#888;">${escapeHtml(song.artists?.name || 'Unknown Artist')}</div>
                    </div>
                </a>
                <button onclick="removeSong('${playlistId}', '${song._id}')"
                        style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:18px; padding:4px 8px;"
                        title="Remove">✕</button>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error('Fetch error:', err);
        container.innerHTML = '<p style="color:#e74c3c;">Error loading songs.</p>';
    }
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

function closeSongsModal() {
    document.getElementById('songsModal').style.display = 'none';
}

// Remove a song
function removeSong(playlistId, songId) {
    showConfirm('Remove this song from the playlist?', async () => {
        try {
            const res = await fetch(`/api/users/playlists/${playlistId}/songs/${songId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                openSongsModal(playlistId, document.getElementById('songsModalTitle').textContent);
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// ─── Render Playlists ──────────────────────────────────────────────────────────
async function loadUserPlaylists() {
    const container = document.getElementById('user-playlists-container');
    try {
        const res = await fetch('/api/users/playlists');
        const data = await res.json(); // Assuming your controller returns { success: true, data: [...] }

        container.innerHTML = '';
        if (data.data.length === 0) {
            container.innerHTML = '<p class="empty-msg">No playlists yet.</p>';
            return;
        }

        data.data.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.style.cursor = 'pointer';
            
            // This allows clicking the card to open your songs modal
            card.onclick = () => openSongsModal(playlist._id, playlist.name);
            
           card.innerHTML = `
                <div class="playlist-info">
                   <div class="playlist-card-top">
                        <div>
                            <h3>${playlist.name}</h3>
                            <p class="playlist-desc">${playlist.description || 'No description'}</p>
                        </div>
                    </div>
                    <div class="playlist-card-footer">
                        <span class="playlist-badge ${playlist.isPublic ? 'badge-public' : 'badge-private'}">
                            ${playlist.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span class="playlist-song-count">${playlist.songs ? playlist.songs.length : 0} songs</span>
                        <button class="playlist-edit-btn" onclick="event.stopPropagation(); openEditPlaylist('${playlist._id}', '${playlist.name.replace(/'/g, "\\'")}', '${(playlist.description || '').replace(/'/g, "\\'")}', ${playlist.isPublic})"><i class="fa-solid fa-pen"></i></button>
                    </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load playlists:", err);
        container.innerHTML = '<p>Error loading playlists.</p>';
    }
}