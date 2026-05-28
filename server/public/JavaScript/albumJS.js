document.addEventListener("DOMContentLoaded", () => {
    



    const stars = document.querySelectorAll(".stars i");
    const hiddenRatingInput = document.getElementById("rating");

    if (stars.length > 0) {
        stars.forEach((star, index1) => {
            star.addEventListener("click", () => {
                // Keep track of the actual number value selected (index starts at 0, so add 1)
                const selectedValue = index1 + 1;
                hiddenRatingInput.value = selectedValue;

                // Toggle visual CSS highlights
                stars.forEach((s, index2) => {
                    index1 >= index2 ? s.classList.add('active') : s.classList.remove('active');
                });
            });
        });
    }

    
    const hearts = document.querySelectorAll(".like-heart");

    hearts.forEach((heart) => {
        heart.addEventListener("click", async () => {
            // Read unique database ID assigned by Mongo inside EJS template
            const reviewId = heart.getAttribute("data-id");
            if (!reviewId) return;

            heart.classList.toggle("active");
            
            const countSpan = heart.parentElement.querySelector(".like-count");
            let currentCount = parseInt(countSpan.textContent) || 0;
            
            // Instantly update the UI on click for smooth feeling
            let actionType = "like";
            if (heart.classList.contains("active")) {
                currentCount++;
            } else {
                currentCount--;
                actionType = "unlike";
            }
            countSpan.textContent = `${currentCount} Likes`;

            // Fire an async API call to update the review counter inside MongoDB cloud
            try {
                await fetch(`/reviews/${reviewId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: actionType })
                });
            } catch (err) {
                console.error("Failed syncing like mutation to cloud cluster:", err);
            }
        });
    });

   
    const reviewForm = document.querySelector("form");
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            const currentScore = parseInt(hiddenRatingInput.value);
            const textContent = document.getElementById("review").value.trim();

            if (currentScore === 0) {
                e.preventDefault(); // Stop form submission
                alert("Please select a star rating level!");
            } else if (!textContent) {
                e.preventDefault();
                alert("Please type a quick comment before saving!");
            }
        });
    }
});