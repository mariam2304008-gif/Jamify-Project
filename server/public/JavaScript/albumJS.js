function showLoginModal() {
    const modal = document.getElementById("login-modal");
    // Only add class if the element actually exists on this page
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

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Toast Notification Helper ---
    function showToast(message, isRedirect = false) {
        if (isRedirect) {
            window.location.href = "/login";
            return;
        }
        
        const toast = document.getElementById("toast-notification");
        const toastMsg = document.getElementById("toast-message");
        
        if (toast && toastMsg) {
            toastMsg.textContent = message;
            toast.classList.add("show");
            
            // Hide automatically after 3 seconds
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    }
    

    // --- 2. Star Rating UI Handler Loop ---
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

    // --- 3. Heart Like Mutation Engine ---
    const hearts = document.querySelectorAll(".like-heart");

    hearts.forEach((heart) => {
        heart.addEventListener("click", async () => {
            const reviewId = heart.getAttribute("data-id");
            const pathParts = window.location.pathname.split('/');
            
            const isAlbumPage = pathParts.includes('albums');
            const parentContext = isAlbumPage ? 'albums' : 'songs';
            const resourceId = pathParts[pathParts.indexOf(parentContext) + 1];

            // Scenario A: Main Entity Heart
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
                        // Redirect to login if not authenticated
                        showLoginModal();
                    }
                } catch (err) {
                    console.error("Failed syncing route like mutation:", err);
                }
                return;
            }

            // Scenario B: Mini Liker (Reviews)
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

   // --- 4. Validation Interceptor ---
    const reviewForm = document.querySelector("form");
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const currentScore = parseInt(hiddenRatingInput.value);
            const textContent = document.getElementById("review").value.trim();

            if (currentScore === 0) {
                showToast("Please select a star rating level!");
                return;
            } else if (!textContent) {
                showToast("Please type a quick comment before saving!");
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
                    showToast(data.message || "Error saving review.");
                }
            } catch (err) {
                console.error("Failed submitting review:", err);
            }
        });
    }

    // --- 5. Tracklist Toggle Section Controller ---
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