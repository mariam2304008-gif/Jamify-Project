function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content')
        .forEach(c => c.classList.remove('active'));

    document.querySelectorAll('.tab')
        .forEach(t => t.classList.remove('active'));

    document.getElementById(tabId)
        .classList.add('active');

    if (btn) {
        btn.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const followBtn = document.getElementById('followBtn');
    const likeBtn = document.getElementById('likeBtn');
    const followersText = document.getElementById('followersCount');
    const likesText = document.getElementById('likesCount');
    const artistIdInput = document.getElementById('artistId');
    const artistImg = document.getElementById('artistImg');

    const loginModal = document.getElementById('loginModal');
    const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
    const confirmLoginBtn = document.getElementById('confirmLoginBtn');

   async function handleArtistAction(url) {
    try {
        const res = await fetch(url, { method: 'POST' });

        const contentType = res.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
            // Server returned HTML (e.g. login redirect) — treat as unauthorized
            return { notAuthorized: true };
        }

        if (res.status === 401) {
            return { notAuthorized: true };
        }

        if (!res.ok) {
            return { error: true };
        }

        const data = await res.json();
        if (!data.success) {
            return { error: true };
        }

        return { success: true, data };
    } catch (err) {
        console.log(err);
        return { error: true };
    }
}

   function openLoginModal() {
    if (loginModal) {
        loginModal.classList.add('show');
    }
}

function closeLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('show');
    }
}

    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', closeLoginModal);
    }

    if (confirmLoginBtn) {
        confirmLoginBtn.addEventListener('click', () => {
            window.location = '/login';
        });
    }

    if (followBtn && artistIdInput) {
        followBtn.addEventListener('click', async () => {
            const artistId = artistIdInput.value;
            const isFollowing = followBtn.innerText.trim() === 'Unfollow';
            const url = isFollowing
                ? `/api/artists/${artistId}/unfollow`
                : `/api/artists/${artistId}/follow`;

            const result = await handleArtistAction(url, followBtn, followersText, isFollowing ? -1 : 1, 'Unfollow', 'Follow');

            if (result && result.notAuthorized) {
                openLoginModal();
                return;
            }

            if (result && result.success) {
                const data = result.data;

                followBtn.innerText = isFollowing ? 'Follow' : 'Unfollow';

                if (followersText) {
                    const currentFollowers = parseInt(followersText.dataset.count, 10) || 0;
                    const nextCount = isFollowing ? currentFollowers - 1 : currentFollowers + 1;
                    followersText.dataset.count = nextCount;
                    followersText.innerText = `${nextCount} Followers`;
                }
            }
        });
    }

    if (likeBtn && artistIdInput) {
    likeBtn.addEventListener('click', async () => {
        const artistId = artistIdInput.value;
        const result = await handleArtistAction(
            `/api/artists/${artistId}/like`,
            likeBtn,
            likesText,
            0,
            'Unlike',
            'Like'
        );

        if (result && result.notAuthorized) {
            openLoginModal();
            return;
        }

        if (result && result.success) {
            const data = result.data;

            likeBtn.classList.toggle('active', data.hasLiked);

            if (likesText) {
                const nextCount = typeof data.likeCount === 'number'
                    ? data.likeCount
                    : parseInt(likesText.dataset.count, 10) || 0;

                likesText.dataset.count = nextCount;
                likesText.innerText = `${nextCount}`;
            }
        }
    });
}

    if (artistImg) {
        artistImg.addEventListener('click', function () {
            const overlay = document.createElement('div');

            overlay.innerHTML = `
                <div id="imageOverlay" style="
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    z-index:9999;
                ">
                    <span id="closeOverlay" style="
                        position:absolute;
                        top:20px;
                        right:30px;
                        font-size:40px;
                        color:white;
                        cursor:pointer;
                    ">
                        &times;
                    </span>

                    <img
                        src="${this.src}"
                        style="
                            max-width:80%;
                            max-height:80%;
                            border-radius:12px;
                        "
                    >
                </div>
            `;

            document.body.appendChild(overlay);

            document.getElementById('closeOverlay')
                .addEventListener('click', () => {
                    overlay.remove();
                });

            overlay.addEventListener('click', (e) => {
                if (e.target.id === 'imageOverlay') {
                    overlay.remove();
                }
            });
        });
    }
});