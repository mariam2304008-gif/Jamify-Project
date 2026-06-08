const express = require('express');
const Song = require('../models/Song');
const router = express.Router();
const songController = require('../controllers/songController');

const protectSession = require('../middleware/protectSession');


router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;

        const songs = await Song.find({
            title: { $regex: q, $options: 'i' }
        }).limit(10);

        res.json({
            success: true,
            data: songs
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false
        });
    }
});
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;

        const songs = await Song.find({
            title: { $regex: q, $options: 'i' }
        }).limit(10);

        res.json({
            success: true,
            data: songs
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false
        });
    }
});

router.get('/:id', songController.getSongById);




router.post('/:id/reviews', songController.addSongReview);


router.post('/:id/like', protectSession, songController.toggleSongLike);
router.post('/reviews/:reviewId/like', protectSession, songController.toggleReviewLike);

module.exports = router;