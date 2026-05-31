const Artist = require('../models/Artist');
const Album = require('../models/album');
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
    const albums = await Album.find({ artist: artist.name }).sort('-releaseDate');

    res.status(200).json({
      success: true,
      data: { artist, albums }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search artists by name
// @route   GET /api/artists/search?q=query
// @access  Public
exports.searchArtists = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const artists = await Artist.find({
      name: { $regex: query, $options: 'i' }
    }).limit(10);

    res.status(200).json({ success: true, count: artists.length, data: artists });
  } catch (err) {
    next(err);
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
