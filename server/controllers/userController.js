// ─── IMPORT YOUR MODELS AT THE TOP OF USERCONTROLLER.JS ───
const User = require('../models/User'); // 🌟 This fixes "User is not defined"
const Review = require('../models/Review');
const Playlist = require('../models/Playlist');

// Make sure you import your custom error handler class if you use it:
const ErrorResponse = require('../utils/errorResponse'); // Or wherever your custom error utility sits

// @desc    Get own profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;

    // Fetch the logged-in user directly from Atlas and populate relationships
    const user = await User.findById(userId).populate([
      {
        path: 'followers',
        select: 'username displayName profileImageUrl' // Unified matching field targets
      },
      {
        path: 'followingUsers', 
        select: 'username displayName profileImageUrl'
      }
    ]);

    if (!user) {
      return next(
        new ErrorResponse(
          'User session profile data could not be found in the database.',
          404
        )
      );
    }

    const reviews = await Review.find({ user: userId }) // or req.params.id for public
  .populate('albumID')
  .populate({
    path: 'songID',
    populate: { path: 'album' },
    options: { strictPopulate: false } // 🌟 Prevents strict schema validation crashes
  });

    const playlists = await Playlist.find({ user: userId })
      .populate('albums')
      .sort('-createdAt');

    // Send the living database results right to EJS
    res.render('profile', {
      user: user,
      reviews: reviews,
      playlists: playlists,
      reviewCount: reviews.length,     
      playlistCount: playlists.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Not authorized, session expired.' });
    }
    
    const userId = req.session.user._id; 
    const fieldsToUpdate = {};
    
    if (req.body.displayName !== undefined) fieldsToUpdate.displayName = req.body.displayName;
    if (req.body.bio !== undefined) fieldsToUpdate.bio = req.body.bio;

    if (req.file) {
      fieldsToUpdate.profileImageUrl = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    // 🌟 CRUCIAL: Update the session data so getProfile reads the new values on reload!
    req.session.user.displayName = user.displayName;
    req.session.user.bio = user.bio;
    if (user.profileImageUrl) req.session.user.profileImageUrl = user.profileImageUrl;
    
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, error: err.message || "Server error while saving profile" });
  }
};

// @desc    Get public profile of any user by ID
// @route   GET /api/users/:id/public
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    const reviews = await Review.find({ user: req.params.id }) // or req.params.id for public
  .populate('albumID')
  .populate({
    path: 'songID',
    populate: { path: 'album' },
    options: { strictPopulate: false } // 🌟 Prevents strict schema validation crashes
  });

    const playlists = await Playlist.find({ user: req.params.id, isPublic: true })
      .populate('albums')
      .sort('-createdAt');

    res.render('publicProfile', { 
      user: user, 
      reviews: reviews, 
      playlists: playlists,
      reviewCount: reviews.length,     
      playlistCount: playlists.length   
    });

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
    }).select('username displayName profileImageUrl').limit(10); // Standardized image key tracking

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
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Authentication missing.' });
    }
    const playlists = await Playlist.find({
      user: req.session.user._id
    })
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

exports.createPlaylist = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Authentication missing.' });
    }
    const playlist = await Playlist.create({
      name: req.body.name,
      description: req.body.description || '',
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      user: req.session.user._id
    });

    res.status(201).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePlaylist = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Authentication missing.' });
    }
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
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

exports.deletePlaylist = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Authentication missing.' });
    }
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
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

exports.addAlbumToPlaylist = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Authentication missing.' });
    }
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    if (playlist.albums.includes(req.params.albumId)) {
      return next(new ErrorResponse('Album already in playlist', 400));
    }

    playlist.albums.push(req.params.albumId);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('albums', 'title artist image');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.removeAlbumFromPlaylist = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Authentication missing.' });
    }
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    playlist.albums = playlist.albums.filter(
      id => id.toString() !== req.params.albumId
    );

    await playlist.save();

    const updated = await Playlist.findById(playlist._id)
      .populate('albums', 'title artist image');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow another User
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    // 🔥 FIX: Switched from mixed tracking dependencies straight to your unified tracking engine
    if (!req.session || !req.session.user) {
      return next(new ErrorResponse('Not authorized, session expired.', 401));
    }

    const targetUserId = req.params.id;
    const currentUserId = req.session.user._id; 

    if (targetUserId === currentUserId.toString()) {
      return next(new ErrorResponse('You cannot follow your own account.', 400));
    }

    // 1. Add target user to current user's following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { followingUsers: targetUserId }
    });

    // 2. Add current user to target user's followers list
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    res.status(200).json({ success: true, message: 'Successfully followed user.' });
  } catch (err) { next(err); }
};

// @desc    Unfollow another User
// @route   POST /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return next(new ErrorResponse('Not authorized, session expired.', 401));
    }

    const currentUserId = req.session.user._id;

    await User.findByIdAndUpdate(currentUserId, { $pull: { followingUsers: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: currentUserId } });
    
    res.status(200).json({ success: true, message: 'Successfully unfollowed user.' });
  } catch (err) { next(err); }
};