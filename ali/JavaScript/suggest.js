function openForm() {
  document.getElementById('form-card').style.display = 'block';
}

function closeForm() {
  document.getElementById('form-card').style.display = 'none';
}

function changeType(type) {
  document.getElementById('title').placeholder = type === 'album' ? 'Album title' : 'Song title';
  document.getElementById('link-label').textContent = type === 'album' ? 'Album Link' : 'Song Link';
}

function submitSuggestion() {
  var title = document.getElementById('title').value.trim();
  var artist = document.getElementById('artist').value.trim();
  var errorMessage = document.getElementById('error-message');

  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  if (title === '') {
    errorMessage.textContent = 'Please enter a title.';
    errorMessage.style.display = 'block';
    return;
  }

  if (artist === '') {
    errorMessage.textContent = 'Please enter an artist name.';
    errorMessage.style.display = 'block';
    return;
  }

  // Save to localStorage
  var suggestion = {
    id:     'sug_' + Date.now(),
    type:   document.querySelector('input[name="type"]:checked').value,
    title:  title,
    artist: artist,
    year:   document.getElementById('releaseYear').value,
    genre:  document.getElementById('genre').value,
    link:   document.getElementById('link-input').value,
    status: 'pending'
  };

  var existing = JSON.parse(localStorage.getItem('jamify_suggestions') || '[]');
  existing.push(suggestion);
  localStorage.setItem('jamify_suggestions', JSON.stringify(existing));

  closeForm();

  var popup = document.getElementById('popup');
  popup.style.display = 'block';
  setTimeout(function() { popup.style.display = 'none'; }, 3000);

  // Refresh the list on the page
  renderSuggestions();
}

function renderSuggestions() {
  var container = document.getElementById('suggestions-container');
  var all = JSON.parse(localStorage.getItem('jamify_suggestions') || '[]');

  if (all.length === 0) {
    container.innerHTML = '<p style="color:#aaa;font-size:14px;">You haven\'t submitted any suggestions yet.</p>';
    return;
  }

  // Show newest first
  var reversed = all.slice().reverse();

  container.innerHTML = reversed.map(function(s) {
    var statusColor = s.status === 'accepted' ? '#155724' : s.status === 'rejected' ? '#721c24' : '#856404';
    var statusBg    = s.status === 'accepted' ? '#d4edda'  : s.status === 'rejected' ? '#f8d7da'  : '#fff3cd';

    return '<div style="background:white;border-radius:10px;padding:18px 22px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div>' +
          '<strong style="font-size:15px;">' + s.title + ' — ' + s.artist + '</strong>' +
          '<div style="font-size:13px;color:#888;margin-top:4px;">' +
            s.type +
            (s.year  ? ' · ' + s.year  : '') +
            (s.genre ? ' · ' + s.genre : '') +
          '</div>' +
        '</div>' +
        '<span style="padding:4px 12px;border-radius:999px;font-size:12px;font-weight:bold;background:' + statusBg + ';color:' + statusColor + ';">' +
          s.status +
        '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

// Show suggestions when page loads
renderSuggestions();
