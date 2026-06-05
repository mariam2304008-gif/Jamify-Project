const Artist = require('../models/Artist');
const Album = require('../models/album');
const Song = require('../models/Song');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
exports.getArtists = async (req, res, next) => {
  try {
    const artists = await Artist.find().sort('name');
    res.status(200).json({ success: true, count: artists.length, data: artists });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single artist with their albums
// @route   GET /api/artists/:id
// @access  Public
exports.getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return next(new ErrorResponse(`Artist not found with id of ${req.params.id}`, 404));
    }

    // Get all albums where artist name matches
    const albums = await Album.find({ artist: artist._id });

    // Get all songs where artist name matches
    const songs = await Song.find({ artists: artist._id });

    res.render('artistProfile', {
  artist,
  albums,
  songs
});
  } catch (err) {
    next(err);
  }
};

// @desc    Search artists by name
// @route   GET /api/artists/search?q=query
// @access  Public
exports.searchArtists = async (req, res) => {

    try {

        const query = req.query.q;

        const artists = await Artist.find({
            name: { $regex: query, $options: 'i' }
        });

        res.json({
            success: true,
            data: artists
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create artist (admin only)
// @route   POST /api/artists
// @access  Private/Admin
exports.createArtist = async (req, res, next) => {
  try {
    const artist = await Artist.create(req.body);
    res.status(201).json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow an Artist
// @route   POST /api/artists/:id/follow
// @access  Private
exports.followArtist = async (req, res) => {

    try {

        const artist = await Artist.findById(req.params.id);

        const currentUserId = '61ac192b1619c87991658b99';

        if (!artist.followers.includes(currentUserId)) {

            artist.followers.push(currentUserId);

            await artist.save();
        }

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

};
// @desc    Unfollow an Artist
// @route   POST /api/artists/:id/unfollow
// @access  Private
exports.unfollowArtist = async (req, res) => {

    try {

        const artist = await Artist.findById(req.params.id);

        const currentUserId = '61ac192b1619c87991658b99';

        artist.followers = artist.followers.filter(
            follower => follower.toString() !== currentUserId
        );

        await artist.save();

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

};
