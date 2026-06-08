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

    
    
    const cardStep = CARD_WIDTH + GAP;
    const realSetStart = total * cardStep; 

    
    
    let currentOffset = realSetStart;

    function setOffset(px, animate) {
        track.style.transition = animate ? 'transform 0.35s ease' : 'none';
        track.style.transform = `translateX(-${px}px)`;
    }

    
    setOffset(currentOffset, false);

    let isAnimating = false;

    track.addEventListener('transitionend', () => {
        
        const totalCards = total * 3; 
        const maxOffset = totalCards * cardStep;

        if (currentOffset >= realSetStart + total * cardStep) {
            
            currentOffset -= total * cardStep;
            setOffset(currentOffset, false);
        } else if (currentOffset < realSetStart - total * cardStep) {
            
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