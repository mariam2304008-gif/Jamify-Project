// Mock reviews data (pending reviews waiting for approval)
let pendingReviews = [
    { id: 1, user: 'john_doe', rating: 5, review: 'Thriller is an absolute masterpiece! Michael Jackson\'s best work.', date: '2024-04-18', album: 'Thriller' },
    { id: 2, user: 'music_lover', rating: 4, review: 'Great album but some tracks could be shorter.', date: '2024-04-17', album: 'Lemonade' },
    { id: 3, user: 'pop_fan', rating: 5, review: 'Amazing vocals and production quality!', date: '2024-04-16', album: 'My Everything' },
    { id: 4, user: 'album_critic', rating: 3, review: 'Good album, interesting themes throughout.', date: '2024-04-15', album: 'Midnights' },
    { id: 5, user: 'casual_listener', rating: 4, review: 'Really enjoyed listening to this from start to finish.', date: '2024-04-14', album: 'Wicked' },
];

// Load reviews on page load
document.addEventListener('DOMContentLoaded', function() {
    displayReviews();
});

// Display pending reviews
function displayReviews() {
    const container = document.getElementById('reviewsContainer');
    const noReviewsMsg = document.getElementById('noReviewsMessage');

    if (pendingReviews.length === 0) {
        container.innerHTML = '';
        noReviewsMsg.style.display = 'block';
        return;
    }

    noReviewsMsg.style.display = 'none';
    container.innerHTML = pendingReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-user-info">
                    <div class="review-user">${escapeHtml(review.user)}</div>
                    <div class="review-meta">
                        <span class="review-rating">★ ${review.rating}/5</span>
                        <span class="review-date">${formatDate(review.date)}</span>
                    </div>
                </div>
            </div>
            <div class="review-content">
                ${escapeHtml(review.review)}
            </div>
            <div class="review-actions">
                <button class="btn-action btn-approve" onclick="approveReview(${review.id})">✓ Approve</button>
                <button class="btn-action btn-deny" onclick="denyReview(${review.id})">✕ Deny</button>
            </div>
        </div>
    `).join('');
}

// Approve review
function approveReview(reviewId) {
    pendingReviews = pendingReviews.filter(r => r.id !== reviewId);
    displayReviews();
    showNotification('Review approved successfully!');
}

// Deny review
function denyReview(reviewId) {
    pendingReviews = pendingReviews.filter(r => r.id !== reviewId);
    displayReviews();
    showNotification('Review denied and removed!');
}

// Show notification
function showNotification(message) {
    const notif = document.getElementById('successNotification');
    document.getElementById('notificationMessage').textContent = message;
    notif.style.display = 'flex';
    setTimeout(() => {
        notif.style.display = 'none';
    }, 3000);
}

// Close notification
function closeNotification() {
    document.getElementById('successNotification').style.display = 'none';
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
