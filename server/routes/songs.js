const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// Middleware helper from your auth middleware folder to block guests
const protectSession = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Please log in to like this track!' });
};

// Define profile path endpoint matching your view link anchor tags
router.get('/:id', songController.getSongById);



// Define form submittal processing pipeline route target matches
router.post('/:id/reviews', songController.addSongReview);

// AJAX Mutation Routes for Real-Time Liking
router.post('/:id/like', protectSession, songController.toggleSongLike);
router.post('/reviews/:reviewId/like', protectSession, songController.toggleReviewLike);

module.exports = router;