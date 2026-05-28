// ─── State ────────────────────────────────────────────────────────────────────
let editingPlaylistId = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    bindEditProfile();
    bindPlaylistModal();
});

// ─── Tab Switching ────────────────────────────────────────────────────────────
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

        // Clean Fix: We iterate over displayName and displayBio (your custom bio field)
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

        // Clean Fix: Pack only displayName and bio into the multipart form data
        const formData = new FormData();
        formData.append('displayName', newName);
        formData.append('bio', newBio); 

        try {
            const res = await fetch('/api/users/profile', { method: 'PUT', body: formData });
            const data = await res.json();

            if (data.success) {
                exitEditMode();
                alert('Profile updated successfully!');
                window.location.reload(); // Reload to display perfectly compiled server values
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            alert('Server error while saving profile');
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

        if (!name) { alert('Please enter a playlist name'); return; }

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
    try {
        const res = await fetch(`/api/users/playlists/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) window.location.reload();
    } catch (err) {
        console.error(err);
    }
}