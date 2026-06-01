const isLoggedIn = require('../middleware/isLoggedIn');

const express = require('express');
const {
  getProfile,
  updateProfile,
  getPublicProfile,
  searchUsers,
  getUsers,
  deleteUser,
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addAlbumToPlaylist,
  removeAlbumFromPlaylist,
  followUser,
  unfollowUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();


// search users
router.route('/search').get(searchUsers);
// Profile routes
router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, upload.single('profileImage'), updateProfile);

// Playlist routes
router.route('/playlists')
  .get(protect, getPlaylists)
  .post(protect, createPlaylist);
  // Place these near your other user profile routes
router.route('/:id/follow').post(protect, followUser);
router.route('/:id/unfollow').post(protect, unfollowUser);

router.route('/playlists/:id')
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

router.route('/playlists/:id/albums/:albumId')
  .post(protect, addAlbumToPlaylist)
  .delete(protect, removeAlbumFromPlaylist);

// Admin routes
router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/:id').delete(protect, authorize('admin'), deleteUser);

// Public profile (must be last to avoid catching other routes)
router.route('/:id/public').get(getPublicProfile);

module.exports = router;
