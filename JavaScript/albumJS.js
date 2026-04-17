const stars = document.querySelectorAll(".stars i");  

stars.forEach((star,index1) => {
    star.addEventListener("click", () => {
        stars.forEach((star,index2) => {
            index1 >= index2 ? star.classList.add('active') : star.classList.remove('active');
        });
    });
});

const hearts = document.querySelectorAll(".like-heart");

hearts.forEach((heart) => {
    heart.addEventListener("click", () => {
        // first we'll toggle the color class
        heart.classList.toggle("active");

        // then we'll find the specific number span next to THIS specific heart
        const countSpan = heart.parentElement.querySelector(".like-count");
        
        // get the current number (examlple "15 Likes" gets converted to int = 15)
        let currentCount = parseInt(countSpan.textContent);

        // increment if active, decrement if not
        if (heart.classList.contains("active")) {
            currentCount++;
        } else {
            currentCount--;
        }

        // last step is to update the text
        countSpan.textContent = `${currentCount} Likes`;
    });
});
