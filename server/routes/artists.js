const express = require('express');
const {
  getArtists,
  getArtist,
  searchArtists,
  createArtist,
  followArtist,
  unfollowArtist
} = require('../controllers/artistController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/search').get(searchArtists);
router.route('/').get(getArtists).post(protect, authorize('admin'), createArtist);
router.route('/:id').get(getArtist);

// Place these at the bottom
router.route('/:id/follow').post(protect, followArtist);
router.route('/:id/unfollow').post(protect, unfollowArtist);

module.exports = router;
