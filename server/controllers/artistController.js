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

// @desc    Follow an Artist
// @route   POST /api/artists/:id/follow
// @access  Private
exports.followArtist = async (req, res, next) => {
  try {
    const artistId = req.params.id;
    const currentUserId = req.user.id;

    // 1. Link artist to user's followingArtists array
    await require('../models/User').findByIdAndUpdate(currentUserId, {
      $addToSet: { followingArtists: artistId }
    });

    // 2. Link user to artist's followers array
    await Artist.findByIdAndUpdate(artistId, {
      $addToSet: { followers: currentUserId }
    });

    res.status(200).json({ success: true, message: 'Successfully following artist.' });
  } catch (err) { next(err); }
};

// @desc    Unfollow an Artist
// @route   POST /api/artists/:id/unfollow
// @access  Private
exports.unfollowArtist = async (req, res, next) => {
  try {
    await require('../models/User').findByIdAndUpdate(req.user.id, { $pull: { followingArtists: req.params.id } });
    await Artist.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
    res.status(200).json({ success: true, message: 'Successfully unfollowed artist.' });
  } catch (err) { next(err); }
};
