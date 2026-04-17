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
  closeForm();

  var popup = document.getElementById('popup');
  popup.style.display = 'block';

  setTimeout(function() {
    popup.style.display = 'none';
  }, 3000);
}
