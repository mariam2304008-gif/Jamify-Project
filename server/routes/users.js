const isLoggedIn = require('../middleware/isLoggedIn');
const express = require('express');
const User = require('../models/User');
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
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        }).limit(10);

        res.json({
            success: true,
            data: users
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false
        });
    }
});
router.route('/:id/follow').post(isLoggedIn, followUser);
router.route('/:id/unfollow').post(isLoggedIn, unfollowUser);

router.route('/playlists/:id')
.put(isLoggedIn, updatePlaylist)
.delete(isLoggedIn, deletePlaylist);

router.route('/playlists/:id/albums/:albumId')
.post(isLoggedIn, addAlbumToPlaylist)
.delete(isLoggedIn, removeAlbumFromPlaylist);

module.exports = router;
