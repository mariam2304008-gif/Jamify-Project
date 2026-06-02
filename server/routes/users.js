const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const User = require('../models/User');
const {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addAlbumToPlaylist,
  removeAlbumFromPlaylist,
  followUser,
  unfollowUser,
  getPublicProfile
} = require('../controllers/userController');

// 1. Base Static / Operational Routes
router.route('/playlists')
  .get(isLoggedIn, getPlaylists)
  .post(isLoggedIn, createPlaylist);

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    }).limit(10);

    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// 2. Specific Playlist Instance Routes (Must come BEFORE /:id parameterized routes)
router.route('/playlists/:id')
  .put(isLoggedIn, updatePlaylist)
  .delete(isLoggedIn, deletePlaylist);

router.route('/playlists/:id/albums/:albumId')
  .post(isLoggedIn, addAlbumToPlaylist)
  .delete(isLoggedIn, removeAlbumFromPlaylist);

// 3. User Social Interaction Routes
router.route('/:id/follow').post(isLoggedIn, followUser);
router.route('/:id/unfollow').post(isLoggedIn, unfollowUser);

// 4. Targeted Public Profile Route 
// Changed to '/:id/public' to completely prevent router overlap issues!
router.get('/:id/public', getPublicProfile);


module.exports = router;