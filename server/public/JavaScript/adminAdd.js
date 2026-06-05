function updateForm(type) {
    const imageLabel = document.getElementById('imageLabel');
    const imageInput = document.getElementById('imageInput');
    if (type === 'song') {
        imageLabel.textContent = 'Song Cover Image *';
        imageInput.setAttribute('required', 'required');
    } else {
        imageLabel.textContent = 'Album Cover Image *';
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
