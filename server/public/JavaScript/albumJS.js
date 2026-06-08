function showLoginModal() {
    const modal = document.getElementById("login-modal");
    
    if (modal) {
        modal.classList.add("show");
    } else {
        console.warn("Login modal element not found on this page.");
    }
}

function closeLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) {
        modal.classList.remove("show");
    } else {
        console.warn("Login modal element not found on this page.");
    }
}


let formToSubmit = null;

function showDeleteModal() {
    const modal = document.getElementById("confirm-delete-modal");
    if (modal) modal.classList.add("show");
}

function closeDeleteModal() {
    const modal = document.getElementById("confirm-delete-modal");
    if (modal) modal.classList.remove("show");
    formToSubmit = null; 
}

document.addEventListener("DOMContentLoaded", () => {

    
    const deleteForms = document.querySelectorAll(".review-delete-form");
    const confirmDeleteBtn = document.getElementById("modal-confirm-delete-btn");

    deleteForms.forEach((form) => {
        form.addEventListener("submit", function (e) {
            
            e.preventDefault(); 
            formToSubmit = this; 
            showDeleteModal();
        });
    });

    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            if (formToSubmit) {
                formToSubmit.submit(); 
            }
        });
    }

    
    const stars = document.querySelectorAll(".stars i");
    const hiddenRatingInput = document.getElementById("rating");

    if (stars.length > 0) {
        stars.forEach((star, index1) => {
            star.addEventListener("click", () => {
                const selectedValue = index1 + 1;
                hiddenRatingInput.value = selectedValue;

                stars.forEach((s, index2) => {
                    index1 >= index2 ? s.classList.add('active') : s.classList.remove('active');
                });
            });
        });
    }

    
    const hearts = document.querySelectorAll(".like-heart");

    hearts.forEach((heart) => {
        heart.addEventListener("click", async () => {
            const reviewId = heart.getAttribute("data-id");
            const pathParts = window.location.pathname.split('/');
            
            const isAlbumPage = pathParts.includes('albums');
            const parentContext = isAlbumPage ? 'albums' : 'songs';
            const resourceId = pathParts[pathParts.indexOf(parentContext) + 1];

            
            if (!reviewId) {
                try {
                    const response = await fetch(`/${parentContext}/${resourceId}/like`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.success) {
                        heart.classList.toggle("active", data.hasLiked);
                        const mainCountSpan = heart.parentElement.querySelector(".like-count");
                        if (mainCountSpan) mainCountSpan.textContent = data.likeCount;
                        
                        const secondaryCounter = document.querySelector(".total-likes-counter");
                        if (secondaryCounter) secondaryCounter.textContent = data.likeCount;
                    } else {
                        
                        showLoginModal();
                    }
                } catch (err) {
                    console.error("Failed syncing route like mutation:", err);
                }
                return;
            }

            
            try {
                const response = await fetch(`/${parentContext}/reviews/${reviewId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.success) {
                    heart.classList.toggle("active", data.hasLiked);
                    const countSpan = heart.parentElement.querySelector(".like-count");
                    if (countSpan) {
                        countSpan.textContent = typeof data.likeCount === 'number' ? `${data.likeCount} Likes` : data.likeCount;
                    }
                } else {
                    showLoginModal();
                }
            } catch (err) {
                console.error("Failed syncing review mutation:", err);
            }
        });
    });

    
    const pathParts = window.location.pathname.split('/');
    const isAlbum = pathParts.includes('albums');
    const parentContext = isAlbum ? 'albums' : 'songs';
    const resourceId = pathParts[pathParts.indexOf(parentContext) + 1];
    
    
    const reviewForm = document.querySelector(`form[action="/${parentContext}/${resourceId}/reviews"]`);
    
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentScore = parseInt(hiddenRatingInput.value);
            const textContent = document.getElementById("review").value.trim();

            if (currentScore === 0) {
                showToast("Please select a star rating level!", "warning");
                return;
            } else if (!textContent) {
                showToast("Please type a quick comment before saving!", "warning");
                return;
            }

            try {
                const response = await fetch(reviewForm.action, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ rating: currentScore, review: textContent })
                });
                const data = await response.json();

                if (data.success) {
                    window.location.reload();
                } else if (data.notLoggedIn) {
                    showLoginModal();
                } else {
                    showToast(data.message || "Error saving review.", "error");
                }
            } catch (err) {
                console.error("Failed submitting review:", err);
            }
        });
    }

    
    const toggleBtn = document.getElementById('toggleTracklistBtn');
    const tracklistSection = document.getElementById('tracklistSection');

    if (toggleBtn && tracklistSection) {
        toggleBtn.addEventListener('click', () => {
            if (tracklistSection.style.display === 'none') {
                tracklistSection.style.display = 'block';
                toggleBtn.textContent = 'Hide Tracklist';
            } else {
                tracklistSection.style.display = 'none';
                toggleBtn.textContent = 'View Tracklist';
            }
        });
    }
});