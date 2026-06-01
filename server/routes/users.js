const isLoggedIn = require('../middleware/isLoggedIn');
const express = require('express');

const {
getPlaylists,
createPlaylist,
updatePlaylist,
deletePlaylist,
addAlbumToPlaylist,
removeAlbumFromPlaylist,
  followUser,
  unfollowUser
} = require('../controllers/userController');

const router = express.Router();

router.route('/playlists')
.get(isLoggedIn, getPlaylists)
.post(isLoggedIn, createPlaylist);
  // Place these near your other user profile routes
router.route('/:id/follow').post(protect, followUser);
router.route('/:id/unfollow').post(protect, unfollowUser);

router.route('/playlists/:id')
.put(isLoggedIn, updatePlaylist)
.delete(isLoggedIn, deletePlaylist);

router.route('/playlists/:id/albums/:albumId')
.post(isLoggedIn, addAlbumToPlaylist)
.delete(isLoggedIn, removeAlbumFromPlaylist);

module.exports = router;
