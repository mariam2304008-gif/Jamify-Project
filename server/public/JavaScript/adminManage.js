let activeForm = null;

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
