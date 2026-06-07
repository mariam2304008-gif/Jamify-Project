let activeForm = null;

function filterCards() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.music-card').forEach(function(card) {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

function showDeleteModal(btn) {
    activeForm = btn.closest('form');
    document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
    if (activeForm) activeForm.submit();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    activeForm = null;
}
