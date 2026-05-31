const User = require('../models/User');
const Review = require('../models/review');
const Playlist = require('../models/Playlist');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get own profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const reviews = await Review.find({ user: req.user.id }).populate('album', 'title image');
    res.status(200).json({ success: true, data: { user, reviews } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      displayName: req.body.displayName,
      email: req.body.email,
      phone: req.body.phone
    };
    if (req.file) fieldsToUpdate.profileImage = `uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public profile of any user by ID
// @route   GET /api/users/:id/public
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(new ErrorResponse('User not found', 404));

    const reviews = await Review.find({ user: req.params.id }).populate('album', 'title image');
    const playlists = await Playlist.find({ user: req.params.id, isPublic: true })
      .populate('albums', 'title artist image');

    res.status(200).json({ success: true, data: { user, reviews, playlists } });
  } catch (err) {
    next(err);
  }
};

// @desc    Search users by username or displayName
// @route   GET /api/users/search?q=query
// @access  Public
exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } }
      ]
    }).select('username displayName profileImage').limit(10);

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// ─── PLAYLIST CONTROLLERS ─────────────────────────────────────────────────────

exports.getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
      .populate('albums', 'title artist image').sort('-createdAt');
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (err) { next(err); }
};

exports.createPlaylist = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const playlist = await Playlist.create(req.body);
    res.status(201).json({ success: true, data: playlist });
  } catch (err) { next(err); }
};

exports.updatePlaylist = async (req, res, next) => {
  try {
    let playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));
    if (playlist.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));

    const { name, description, isPublic } = req.body;
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    await playlist.save();

    res.status(200).json({ success: true, data: playlist });
  } catch (err) { next(err); }
};

exports.deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));
    if (playlist.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));
    await Playlist.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.addAlbumToPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));
    if (playlist.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));
    if (playlist.albums.includes(req.params.albumId)) return next(new ErrorResponse('Album already in playlist', 400));

    playlist.albums.push(req.params.albumId);
    await playlist.save();
    const updated = await Playlist.findById(playlist._id).populate('albums', 'title artist image');
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.removeAlbumFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));
    if (playlist.user.toString() !== req.user.id) return next(new ErrorResponse('Not authorized', 403));

    playlist.albums = playlist.albums.filter(id => id.toString() !== req.params.albumId);
    await playlist.save();
    const updated = await Playlist.findById(playlist._id).populate('albums', 'title artist image');
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};
