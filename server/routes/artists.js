const express = require('express');
const Artist = require('../models/Artist');
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

router.route('/')
  .get(getArtists)
  .post(protect, authorize('admin'), createArtist);

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

        res.render('artistProfile', {
            artist,
            albums
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// KEEP THIS LAST


// Place these at the bottom
router.route('/:id/follow').post(followArtist);
router.route('/:id/unfollow').post(unfollowArtist);
// TEMP DEBUG ROUTE

router.route('/:id').get(getArtist);
module.exports = router;