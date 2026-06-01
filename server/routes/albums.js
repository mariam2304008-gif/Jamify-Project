const express = require('express');

const router = express.Router();
const albumController = require('../controllers/albumController');

// Clean session guard for AJAX liking actions
const protectSession = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Please log in to like this album!' });
};

router.get('/', albumController.getAllAlbums);
router.get('/search', albumController.searchAlbums);
router.get('/:id', albumController.getAlbumById);
router.post('/', albumController.createAlbum);
router.put('/:id', albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);
router.post('/:id/reviews', albumController.addReview);

// Real-Time Album Liking Endpoints
router.post('/:id/like', protectSession, albumController.toggleAlbumLike);
router.post('/reviews/:reviewId/like', protectSession, albumController.toggleAlbumReviewLike);

module.exports = router;