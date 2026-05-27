const User = require('../models/User');
const Review = require('../models/Review');
const Playlist = require('../models/Playlist');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user profile (includes user data and reviews)
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const reviews = await Review.find({ user: req.user.id }).populate('album', 'title image');

    res.status(200).json({
      success: true,
      data: {
        user,
        reviews
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      displayName: req.body.displayName,
      email: req.body.email,
      phone: req.body.phone
    };

    if (req.file) {
      fieldsToUpdate.profileImage = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// ─── PLAYLIST CONTROLLERS ────────────────────────────────────────────────────

// @desc    Get all playlists for logged-in user
// @route   GET /api/users/playlists
// @access  Private
exports.getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
      .populate('albums', 'title artist image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a playlist
// @route   POST /api/users/playlists
// @access  Private
exports.createPlaylist = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const playlist = await Playlist.create(req.body);

    res.status(201).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a playlist (name / description / isPublic)
// @route   PUT /api/users/playlists/:id
// @access  Private
exports.updatePlaylist = async (req, res, next) => {
  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse(`Playlist not found with id of ${req.params.id}`, 404));
    }

    // Ensure playlist belongs to user
    if (playlist.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this playlist', 403));
    }

    const { name, description, isPublic } = req.body;
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/users/playlists/:id
// @access  Private
exports.deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse(`Playlist not found with id of ${req.params.id}`, 404));
    }

    if (playlist.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this playlist', 403));
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add an album to a playlist
// @route   POST /api/users/playlists/:id/albums/:albumId
// @access  Private
exports.addAlbumToPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse(`Playlist not found with id of ${req.params.id}`, 404));
    }

    if (playlist.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to modify this playlist', 403));
    }

    // Avoid duplicates
    if (playlist.albums.includes(req.params.albumId)) {
      return next(new ErrorResponse('Album already in playlist', 400));
    }

    playlist.albums.push(req.params.albumId);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id).populate('albums', 'title artist image');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove an album from a playlist
// @route   DELETE /api/users/playlists/:id/albums/:albumId
// @access  Private
exports.removeAlbumFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse(`Playlist not found with id of ${req.params.id}`, 404));
    }

    if (playlist.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to modify this playlist', 403));
    }

    playlist.albums = playlist.albums.filter(
      (albumId) => albumId.toString() !== req.params.albumId
    );
    await playlist.save();

    const updated = await Playlist.findById(playlist._id).populate('albums', 'title artist image');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
