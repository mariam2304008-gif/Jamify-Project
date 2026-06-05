function openForm() {
    document.getElementById('form-card').style.display = 'block';
}

function closeForm() {
    document.getElementById('form-card').style.display = 'none';
}

function changeType(type) {
    const titleInput = document.getElementById('title');
    const linkLabel = document.getElementById('link-label');
    titleInput.placeholder = type === 'album' ? 'Album title' : 'Song title';
    linkLabel.textContent = type === 'album' ? 'Album Link' : 'Song Link';
}

function validateForm() {
    let valid = true;

    const link = document.getElementById('link-input').value.trim();
    const linkError = document.getElementById('link-error');
    if (link && !/^https?:\/\/.+/.test(link)) {
        linkError.style.display = 'block';
        valid = false;
    } else {
        linkError.style.display = 'none';
    }

    const genre = document.getElementById('genre').value.trim();
    const genreError = document.getElementById('genre-error');
    if (genre && /\d/.test(genre)) {
        genreError.style.display = 'block';
        valid = false;
    } else {
        genreError.style.display = 'none';
    }

    return valid;
}
