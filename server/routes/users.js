const express = require('express');
const {
  getProfile,
  updateProfile,
  getUsers,
  deleteUser,
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addAlbumToPlaylist,
  removeAlbumFromPlaylist
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Profile routes
router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, upload.single('profileImage'), updateProfile);

// Admin user management
router
  .route('/')
  .get(protect, authorize('admin'), getUsers);

router
  .route('/:id')
  .delete(protect, authorize('admin'), deleteUser);

// Playlist routes
router
  .route('/playlists')
  .get(protect, getPlaylists)
  .post(protect, createPlaylist);

router
  .route('/playlists/:id')
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

router
  .route('/playlists/:id/albums/:albumId')
  .post(protect, addAlbumToPlaylist)
  .delete(protect, removeAlbumFromPlaylist);

module.exports = router;
