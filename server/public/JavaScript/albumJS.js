document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Star Rating UI Handler Loop
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

  // 2. Heart Like Mutation Engine (Dynamic path routing for Songs & Albums)
    const hearts = document.querySelectorAll(".like-heart");

    hearts.forEach((heart) => {
        heart.addEventListener("click", async () => {
            const reviewId = heart.getAttribute("data-id");
            const pathParts = window.location.pathname.split('/');
            
            // Determine dynamically if we are currently standing inside an album stack or song stack view
            const isAlbumPage = pathParts.includes('albums');
            const parentContext = isAlbumPage ? 'albums' : 'songs';
            const resourceId = pathParts[pathParts.indexOf(parentContext) + 1];

            // --- SCENARIO A: THIS IS A MAIN ENTITY HEADER HEART BUTTON ---
            if (!reviewId) {
                try {
                    const response = await fetch(`/${parentContext}/${resourceId}/like`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await response.json();

                    if (data.success) {
                        heart.classList.toggle("active", data.hasLiked);
                        
                        // Sync wrapper numeric span text counters
                        const mainCountSpan = heart.parentElement.querySelector(".like-count");
                        if (mainCountSpan) mainCountSpan.textContent = data.likeCount;
                        
                        // Sync your secondary grid info counter label simultaneously
                        const secondaryCounter = document.querySelector(".total-likes-counter");
                        if (secondaryCounter) secondaryCounter.textContent = data.likeCount;
                    } else {
                        alert(data.message || "Please sign in to update collections!");
                    }
                } catch (err) {
                    console.error("Failed syncing route like mutation:", err);
                }
                return;
            }

            // --- SCENARIO B: THIS IS A MINILIKER INSIDE THE REVIEWS STREAM ---
            try {
                const response = await fetch(`/${parentContext}/reviews/${reviewId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();

                if (data.success) {
                    heart.classList.toggle("active", data.hasLiked);
                    const countSpan = heart.parentElement.querySelector(".like-count");
                    if (countSpan) {
                        countSpan.textContent = typeof data.likeCount === 'number' ? `${data.likeCount} Likes` : data.likeCount;
                    }
                } else {
                    alert(data.message || "Please sign in to vote!");
                }
            } catch (err) {
                console.error("Failed syncing review mutation:", err);
            }
        });
    });
    // 3. Validation interceptor
    const reviewForm = document.querySelector("form");
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            const currentScore = parseInt(hiddenRatingInput.value);
            const textContent = document.getElementById("review").value.trim();

            if (currentScore === 0) {
                e.preventDefault(); 
                alert("Please select a star rating level!");
            } else if (!textContent) {
                e.preventDefault();
                alert("Please type a quick comment before saving!");
            }
        });
    }

    // 4. Tracklist Toggle Section Controller
    const toggleBtn = document.getElementById('toggleTracklistBtn');
    const tracklistSection = document.getElementById('tracklistSection');

    // FIXED: Guard clause protects song pages that do not have this toggle container
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