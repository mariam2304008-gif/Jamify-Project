
(function () {
  // Inject modal HTML once
  const modalHTML = `
    <div id="atp-overlay" style="display:none;" onclick="if(event.target===this)closeAddToPlaylist()">
      <div id="atp-modal">
        <div id="atp-header">
          <h3>Add to Playlist</h3>
          <button id="atp-close" onclick="closeAddToPlaylist()">✕</button>
        </div>
        <div id="atp-body">
          <div id="atp-list"></div>
          <div id="atp-new">
            <p>No playlists yet? Create one:</p>
            <input type="text" id="atp-new-name" placeholder="Playlist name">
            <button id="atp-create-btn" onclick="atpCreateAndAdd()">Create & Add</button>
          </div>
        </div>
      </div>
    </div>
    <style>
      #atp-overlay {
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.5); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
      }
      #atp-modal {
        background: white; border-radius: 14px;
        width: 340px; max-height: 80vh;
        overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        font-family: inherit;
      }
      #atp-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 18px 20px 10px; border-bottom: 1px solid #f0f0f0;
      }
      #atp-header h3 { margin: 0; font-size: 17px; }
      #atp-close {
        background: none; border: none; font-size: 18px;
        cursor: pointer; color: #888; padding: 0;
      }
      #atp-body { padding: 12px 20px 20px; }
      .atp-playlist-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 12px; border-radius: 8px; margin: 6px 0;
        background: #fafafa; border: 1px solid #f0f0f0;
        cursor: pointer; transition: background 0.15s;
      }
      .atp-playlist-item:hover { background: #f5e6e6; border-color: #e74c3c; }
      .atp-playlist-item.added { background: #e8f5e9; border-color: #4caf50; }
      .atp-playlist-name { font-size: 14px; font-weight: 600; }
      .atp-playlist-count { font-size: 12px; color: #888; }
      .atp-add-btn {
        padding: 5px 12px; border-radius: 20px; border: none;
        background: #e74c3c; color: white; font-size: 12px;
        cursor: pointer; font-family: inherit;
      }
      .atp-add-btn.added { background: #4caf50; cursor: default; }
      #atp-new { margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0; }
      #atp-new p { font-size: 13px; color: #888; margin: 0 0 8px; }
      #atp-new-name {
        width: 100%; padding: 8px 12px; border-radius: 8px;
        border: 1px solid #ddd; font-size: 14px; box-sizing: border-box;
        font-family: inherit; margin-bottom: 8px;
      }
      #atp-create-btn {
        width: 100%; padding: 9px; border-radius: 8px; border: none;
        background: #e74c3c; color: white; font-size: 14px;
        cursor: pointer; font-family: inherit; font-weight: 600;
      }
      #atp-create-btn:hover { background: #c0392b; }
      .atp-empty { color: #888; font-size: 13px; font-style: italic; text-align: center; padding: 10px 0; }
    </style>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  });

  // State
  let _itemId = null;
  let _itemType = 'album'; // 'album' or 'song'
  let _playlists = [];

  window.openAddToPlaylist = async function (itemId, itemType = 'album') {
    const token = '';

    _itemId = itemId;
    _itemType = itemType;

    document.getElementById('atp-overlay').style.display = 'flex';
    document.getElementById('atp-list').innerHTML = '<p class="atp-empty">Loading...</p>';
    document.getElementById('atp-new').style.display = 'none';

    try {
      const res = await fetch('/api/users/playlists', {
    credentials: 'include'
});
      const data = await res.json();

      if (data.success) {
        _playlists = data.data;
        renderPlaylistList();
      } else {
        document.getElementById('atp-list').innerHTML = '<p class="atp-empty">Could not load playlists.</p>';
        document.getElementById('atp-new').style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      document.getElementById('atp-list').innerHTML = '<p class="atp-empty">Error loading playlists.</p>';
    }
  };

  function renderPlaylistList() {
    const list = document.getElementById('atp-list');
    const newSection = document.getElementById('atp-new');

    if (_playlists.length === 0) {
      list.innerHTML = '<p class="atp-empty">You have no playlists yet.</p>';
      newSection.style.display = 'block';
      return;
    }

    newSection.style.display = 'block';
    list.innerHTML = '';

    _playlists.forEach(pl => {
      // Check if item already in playlist
      const alreadyAdded = pl.albums && pl.albums.some(a =>
        (typeof a === 'string' ? a : a._id) === _itemId
      );

      const item = document.createElement('div');
      item.className = `atp-playlist-item${alreadyAdded ? ' added' : ''}`;
      item.innerHTML = `
        <div>
          <div class="atp-playlist-name">${escHtml(pl.name)}</div>
          <div class="atp-playlist-count">${pl.albums ? pl.albums.length : 0} items</div>
        </div>
        <button class="atp-add-btn${alreadyAdded ? ' added' : ''}"
          onclick="atpAddTo('${pl._id}', this)"
          ${alreadyAdded ? 'disabled' : ''}>
          ${alreadyAdded ? '✓ Added' : '+ Add'}
        </button>
      `;
      list.appendChild(item);
    });
  }

  window.atpAddTo = async function (playlistId, btn) {
    
    const url = _itemType === 'album'
      ? `/api/users/playlists/${playlistId}/albums/${_itemId}`
      : `/api/users/playlists/${playlistId}/songs/${_itemId}`;

    try {
      btn.disabled = true;
      btn.textContent = '...';

      const res = await fetch(url, {
  method: 'POST',
  credentials: 'include'
});
      const data = await res.json();

      if (data.success) {
        btn.textContent = '✓ Added';
        btn.classList.add('added');
        btn.closest('.atp-playlist-item').classList.add('added');
        // Update local count
        const countEl = btn.closest('.atp-playlist-item').querySelector('.atp-playlist-count');
        const current = parseInt(countEl.textContent);
        countEl.textContent = `${current + 1} items`;
      } else {
        btn.disabled = false;
        btn.textContent = '+ Add';
        showToast(data.error || 'Failed to add to playlist', 'error');
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = '+ Add';
      console.error(err);
    }
  };

  window.atpCreateAndAdd = async function () {
    const name = document.getElementById('atp-new-name').value.trim();

    if (!name) { showToast('Please enter a playlist name', 'warning'); return; }

    const createBtn = document.getElementById('atp-create-btn');
    createBtn.textContent = 'Creating...';
    createBtn.disabled = true;

    try {
      // Create playlist
      const createRes = await fetch('/api/users/playlists', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name, isPublic: true })
});

const text = await createRes.text();
console.log(text);

const createData = JSON.parse(text);

      if (!createData.success) {
        showToast(createData.error || 'Failed to create playlist', 'error');
        createBtn.textContent = 'Create & Add';
        createBtn.disabled = false;
        return;
      }

      const newPlaylist = createData.data;
      _playlists.push(newPlaylist);

      // Add item to new playlist
      const addRes = await fetch(`/api/users/playlists/${newPlaylist._id}/albums/${_itemId}`, {
  method: 'POST',
  credentials: 'include'
});
      const addData = await addRes.json();

      if (addData.success) {
        document.getElementById('atp-new-name').value = '';
        createBtn.textContent = 'Create & Add';
        createBtn.disabled = false;
        renderPlaylistList();
        // Show success briefly
        const list = document.getElementById('atp-list');
        const msg = document.createElement('p');
        msg.style.cssText = 'color:#4caf50;font-size:13px;text-align:center;margin:5px 0;';
        msg.textContent = `✓ Created "${name}" and added!`;
        list.prepend(msg);
        setTimeout(() => msg.remove(), 3000);
      }
    } catch (err) {
      console.error(err);
      createBtn.textContent = 'Create & Add';
      createBtn.disabled = false;
    }
  };

  window.closeAddToPlaylist = function () {
    document.getElementById('atp-overlay').style.display = 'none';
  };

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
  }
})();
