function updateForm(type) {
    const imageLabel = document.getElementById('imageLabel');
    const imageInput = document.getElementById('imageInput');
    const albumField = document.getElementById('albumField');
    const trackNumberField = document.getElementById('trackNumberField');

    if (type === 'song') {
        imageLabel.textContent = 'Song Cover Image';
        albumField.style.display = 'block';
        trackNumberField.style.display = 'block';
    } else {
        imageLabel.textContent = 'Album Cover Image *';
        albumField.style.display = 'none';
        trackNumberField.style.display = 'none';
        document.getElementById('albumSelect').value = '';
        imageInput.setAttribute('required', 'required');
    }
    updateImageRequired();
}

function updateImageRequired() {
    const imageInput = document.getElementById('imageInput');
    const albumSelect = document.getElementById('albumSelect');
    if (albumSelect && albumSelect.value) {
        imageInput.removeAttribute('required');
    } else {
        imageInput.setAttribute('required', 'required');
    }
}

function validateAdminForm() {
    const spotifyLink = document.getElementById('spotifyLink').value.trim();
    const anghamiLink = document.getElementById('anghamiLink').value.trim();
    const linkError = document.getElementById('link-error');

    if (!spotifyLink && !anghamiLink) {
        linkError.style.display = 'block';
        return false;
    }
    linkError.style.display = 'none';
    return true;
}
