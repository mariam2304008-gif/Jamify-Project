// Star rating functionality
const stars = document.querySelectorAll(".stars i");  

if (stars.length > 0) {
    stars.forEach((star, index1) => {
        star.addEventListener("click", () => {
            stars.forEach((star, index2) => {
                index1 >= index2 ? star.classList.add('active') : star.classList.remove('active');
            });
        });
    });
}

// Heart/like functionality
const hearts = document.querySelectorAll(".like-heart");

hearts.forEach((heart) => {
    heart.addEventListener("click", () => {
        heart.classList.toggle("active");
        
        const countSpan = heart.parentElement.querySelector(".like-count");
        let currentCount = parseInt(countSpan.textContent);
        
        if (heart.classList.contains("active")) {
            currentCount++;
        } else {
            currentCount--;
        }
        
        countSpan.textContent = `${currentCount} Likes`;
    });
});

// Review submission functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get current album name from the page
    const albumTitle = document.getElementById('head') ? document.getElementById('head').textContent : '';
    
    // Load existing reviews for this album
    loadAlbumReviews(albumTitle);
    
    // Handle submit button
    const submitBtn = document.getElementById('submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            submitReview(albumTitle);
        });
    }
});

function getActiveStars() {
    const activeStars = document.querySelectorAll('.stars i.active');
    return activeStars.length;
}

function getStarRatingHTML(rating) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            html += '<i class="fa-solid fa-star active"></i>';
        } else {
            html += '<i class="fa-solid fa-star"></i>';
        }
    }
    return html;
}

function submitReview(albumTitle) {
    const rating = getActiveStars();
    const reviewText = document.getElementById('review').value.trim();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (!currentUser) {
        alert('Please log in to submit a review');
        return;
    }
    
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }
    
    if (!reviewText) {
        alert('Please write a review');
        return;
    }
    
    // Create review object
    const review = {
        id: Date.now(),
        albumTitle: albumTitle,
        albumFile: getAlbumFileName(albumTitle),
        userName: currentUser.name || 'User',
        userUsername: currentUser.username || 'user',
        rating: rating,
        reviewText: reviewText,
        date: new Date().toLocaleDateString(),
        likes: 0
    };
    
    // Get existing reviews from localStorage
    let allReviews = JSON.parse(localStorage.getItem('jamifyReviews')) || [];
    
    // Add new review
    allReviews.push(review);
    
    // Save to localStorage
    localStorage.setItem('jamifyReviews', JSON.stringify(allReviews));
    
    // Clear form
    document.getElementById('review').value = '';
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => star.classList.remove('active'));
    
    // Reload reviews
    loadAlbumReviews(albumTitle);
    
    alert('Review submitted successfully!');
}

function getAlbumFileName(albumTitle) {
    // Map album titles to their file names
    const albumMap = {
        'Sweetener': 'sweetener.html',
        'Thriller': 'thriller.html',
        'Lemonade': 'lemonade.html',
        'Beyoncé': 'beyonce.html',
        'Daydream': 'daydream.html',
        'emails i can\'t send': 'emails.html',
        'A Head Full Of Dreams': 'headfullofdreams.html',
        'My Everything': 'myeverything.html',
        'Midnight Sun': 'MidnightSun.html',
        'Wicked': 'wicked.html',
        'Writing\'s on the Wall': 'writingsonthewall.html'
    };
    return albumMap[albumTitle] || '';
}

function loadAlbumReviews(albumTitle) {
    const allReviews = JSON.parse(localStorage.getItem('jamifyReviews')) || [];
    const albumFile = getAlbumFileName(albumTitle);
    
    // Filter reviews for this album
    const albumReviews = allReviews.filter(r => r.albumFile === albumFile);
    
    // Get the reviews container
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;
    
    // Clear existing reviews but keep the container structure
    // Find the header label if it exists
    const existingHeader = reviewsContainer.querySelector('label');
    
    // Clear all content
    reviewsContainer.innerHTML = '';
    
    // Add header back if it existed
    if (existingHeader) {
        const newHeader = document.createElement('label');
        newHeader.id = existingHeader.id;
        newHeader.style = existingHeader.getAttribute('style');
        newHeader.textContent = existingHeader.textContent;
        reviewsContainer.appendChild(newHeader);
    }
    
    // Add reviews
    albumReviews.forEach(review => {
        const reviewBox = createReviewElement(review);
        reviewsContainer.appendChild(reviewBox);
    });
    
    // If no reviews, show a message
    if (albumReviews.length === 0) {
        const noReviewsMsg = document.createElement('p');
        noReviewsMsg.style.textAlign = 'center';
        noReviewsMsg.style.color = 'rgb(81, 81, 81)';
        noReviewsMsg.textContent = 'No reviews yet. Be the first to review!';
        reviewsContainer.appendChild(noReviewsMsg);
    }
}

function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'reviewBox';
    div.innerHTML = `
        <div class="reviewerInfo">
            <img src="Images/album-profile-images/epic.png" alt="Profile" id="profile-icon">
            
            <div class="user-meta-group">
                <p id="main" style="font-size: 16px; margin: 0;">
                    ${review.userName} <br>
                    <span id="review-rating" style="color:rgb(226, 186, 29);">
                        ${getStarRatingHTML(review.rating)}
                    </span>
                </p>
            </div>
        
            <p class="review-date">${review.date}</p>
        </div>
        <hr>
        <p id="review">${review.reviewText}</p>
        <div class="like-container">
            <i class="fa-solid fa-heart like-heart"></i>
            <span class="like-count" style="font-size: 12px; color: grey;">${review.likes} Likes</span>
        </div>
    `;
    
    // Add heart click functionality to the new review
    const heart = div.querySelector('.like-heart');
    heart.addEventListener('click', () => {
        heart.classList.toggle("active");
        const countSpan = div.querySelector(".like-count");
        let currentCount = parseInt(countSpan.textContent);
        if (heart.classList.contains("active")) {
            currentCount++;
        } else {
            currentCount--;
        }
        countSpan.textContent = `${currentCount} Likes`;
    });
    
    return div;
}
