document.querySelectorAll('.genre-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');

    const CARD_WIDTH = 200;
    const GAP = 25;
    const CARDS_PER_PAGE = 4;
    const STEP = (CARD_WIDTH + GAP) * CARDS_PER_PAGE;

    const originalCards = Array.from(track.querySelectorAll('.album-card'));
    const total = originalCards.length;

    if (total <= CARDS_PER_PAGE) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    // --- Build: [clone of full set] [real cards] [clone of full set] ---
    const before = originalCards.map(c => {
        const cl = c.cloneNode(true);
        cl.setAttribute('aria-hidden', 'true');
        return cl;
    });
    const after = originalCards.map(c => {
        const cl = c.cloneNode(true);
        cl.setAttribute('aria-hidden', 'true');
        return cl;
    });

    before.reverse().forEach(c => track.insertBefore(c, track.firstChild));
    after.forEach(c => track.appendChild(c));

    // The real set sits at index `total` (after the prepended clones)
    // Each card occupies (CARD_WIDTH + GAP)px
    const cardStep = CARD_WIDTH + GAP;
    const realSetStart = total * cardStep; // px offset where real set begins

    // We track which card index (within the infinite sequence) is leftmost visible
    // Start showing real card 0
    let currentOffset = realSetStart;

    function setOffset(px, animate) {
        track.style.transition = animate ? 'transform 0.35s ease' : 'none';
        track.style.transform = `translateX(-${px}px)`;
    }

    // Place without animation
    setOffset(currentOffset, false);

    let isAnimating = false;

    track.addEventListener('transitionend', () => {
        // After animation ends, check if we're in clone territory and silently reset
        const totalCards = total * 3; // before + real + after
        const maxOffset = totalCards * cardStep;

        if (currentOffset >= realSetStart + total * cardStep) {
            // Went past end of real set into after-clones — jump to mirror in real set
            currentOffset -= total * cardStep;
            setOffset(currentOffset, false);
        } else if (currentOffset < realSetStart - total * cardStep) {
            // Went before start of real set into before-clones — jump to mirror in real set  
            currentOffset += total * cardStep;
            setOffset(currentOffset, false);
        }

        isAnimating = false;
    });

    nextBtn.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        currentOffset += STEP;
        setOffset(currentOffset, true);
    });

    prevBtn.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        currentOffset -= STEP;
        setOffset(currentOffset, true);
    });
});