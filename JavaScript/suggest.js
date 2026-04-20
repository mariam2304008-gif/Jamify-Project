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
  // Get form values
  var title = document.getElementById('title').value.trim();
  var artist = document.getElementById('artist').value.trim();
  var errorMessage = document.getElementById('error-message');

  // Reset error message
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  // Validate required fields
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

  // If validation passes, proceed with submission
  closeForm();

  var popup = document.getElementById('popup');
  popup.style.display = 'block';

  setTimeout(function() {
    popup.style.display = 'none';
  }, 3000);
}
