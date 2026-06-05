function updateForm(type) {
    const imageLabel = document.getElementById('imageLabel');
    const imageInput = document.getElementById('imageInput');
    if (type === 'song') {
        imageLabel.textContent = 'Song Cover Image (optional)';
        imageInput.removeAttribute('required');
    } else {
        imageLabel.textContent = 'Album Cover Image *';
        imageInput.setAttribute('required', 'required');
    }
}
