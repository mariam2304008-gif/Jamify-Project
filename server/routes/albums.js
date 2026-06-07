const express = require('express');

const router = express.Router();
const albumController = require('../controllers/albumController');

const protectSession = require('../middleware/protectSession');

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