const express = require('express');
const {
  getArtists,
  getArtist,
  searchArtists,
  createArtist
} = require('../controllers/artistController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/search').get(searchArtists);
router.route('/').get(getArtists).post(protect, authorize('admin'), createArtist);
router.route('/:id').get(getArtist);

module.exports = router;
