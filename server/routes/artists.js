const express = require('express');
const Artist = require('../models/Artist');
const Album = require('../models/album');
const Song = require('../models/Song');
const {
  getArtists,
  getArtist,
  searchArtists,
  createArtist,
  followArtist,
  unfollowArtist,
  toggleArtistLike
} = require('../controllers/artistController');

const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();


// DEBUG ROUTES FIRST
router.get('/test-artists', async (req, res) => {
  console.log(Artist.collection.name);
  console.log(Artist.db.name);
  console.log(await Artist.countDocuments());
    const artists = await Artist.find();
    res.json(artists);
});

router.get('/debug-db', async (req, res) => {
    const mongoose = require('mongoose');

    res.json({
        dbName: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections)
    });
});
router.route('/search').get(searchArtists);



// PROFILE ROUTE
router.get('/:id/profile', async (req, res) => {
    try {

        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).send('Artist not found');
        }

        const Album = require('../models/album');

        const albums = await Album.find({
            artist: artist._id
        });

        const songs = await Song.find({
            artists: artist._id
        });

        res.render('artistProfile', {
            artist,
            albums,
            songs
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// KEEP THIS LAST

const upload = require('../middleware/upload');
router.route('/').get(getArtists).post(isLoggedIn, isAdmin, upload.single('image'), createArtist);
router.route('/:id/follow').post(isLoggedIn, followArtist);
router.route('/:id/unfollow').post(isLoggedIn, unfollowArtist);
router.route('/:id/like').post(isLoggedIn, toggleArtistLike);

// TEMP DEBUG ROUTE
// router.route('/:id').get(getArtist);
module.exports = router;