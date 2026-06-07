const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const User = require('../models/User');
const {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addAlbumToPlaylist,
  followUser,
  unfollowUser,
  getPublicProfile,
  addSongToPlaylist,
  removeSongFromPlaylist,
  updateProfile
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

// Profile update route
router.route('/profile')
  .put(isLoggedIn, updateProfile);

// 2. Specific Playlist Instance Routes (Must come BEFORE /:id parameterized routes)
const Playlist = require('../models/Playlist');

router.route('/playlists/:id')
  .get(async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id)
        .populate({
          path: 'songs',
          populate: { path: 'artists', select: 'name' }
        });
      if (!playlist) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: playlist });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  })
  .put(isLoggedIn, updatePlaylist)
  .delete(isLoggedIn, deletePlaylist);

router.route('/playlists/:id/album/:albumId')
  .post(isLoggedIn, addAlbumToPlaylist);

  router.route('/playlists/:id/songs/:songId')
  .post(isLoggedIn, addSongToPlaylist)
  .delete(isLoggedIn, removeSongFromPlaylist);

// 3. User Social Interaction Routes
router.route('/:id/follow').post(isLoggedIn, followUser);
router.route('/:id/unfollow').post(isLoggedIn, unfollowUser);

// 4. Targeted Public Profile Route 
// Changed to '/:id/public' to completely prevent router overlap issues!
router.get('/:id/public', getPublicProfile);

router.post(
    '/profile/photo',
    isLoggedIn,
    (req, res, next) => {

        upload.single('profilePhoto')(req, res, function(err) {

            if (err) {
                console.log(err);
                return res.redirect('/profile');
            }

            next();
        });

    },

    async (req, res) => {

        try {

            const user = await User.findById(req.session.user._id);

            if (req.file) {

                user.profileImageUrl = '/uploads/' + req.file.filename;

                await user.save();

                req.session.user = user;
            }

            res.redirect('/profile');

        } catch (err) {

            console.error(err);
            res.redirect('/profile');
        }
    }
);

module.exports = router;