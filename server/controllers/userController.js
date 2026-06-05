const User = require('../models/User');
const Review = require('../models/review');
const Playlist = require('../models/Playlist');
const ErrorResponse = require('../utils/errorResponse');
const Song = require('../models/Song')


exports.getProfile = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;

    // 🌟 FIX: Updated 'profileImage' to 'profileImageUrl' to match your upload naming
    const user = await User.findById(userId).populate([
      {
        path: 'followers',
        select: 'username displayName profileImageUrl' 
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

    const reviews = await Review.find({ user: userId })
      .populate('albumID')
      .populate({
        path: 'songID',
        populate: { path: 'album' }
      });

    const playlists = await Playlist.find({ user: userId })
      .sort('-createdAt');

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
    // 1. Guard check: Use the session user ID to match getProfile's login tracking
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Not authorized, session expired.' });
    }
    
    const userId = req.session.user.id;
    const fieldsToUpdate = {};
    
    // Explicitly pull ONLY displayName and bio. Email is completely locked out.
    if (req.body.displayName !== undefined) fieldsToUpdate.displayName = req.body.displayName;
    if (req.body.bio !== undefined) fieldsToUpdate.bio = req.body.bio;

    if (req.file) {
      fieldsToUpdate.profileImageUrl = `uploads/${req.file.filename}`;
    }

    // 2. Fix: Find by the verified session userId
    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    
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
    const targetUserId = req.params.id;

    if (req.session && req.session.user) {
      const loggedInId = req.session.user._id || req.session.user.id;
      if (loggedInId && loggedInId.toString() === targetUserId) {
        return res.redirect('/profile'); 
      }
    }

    // 🌟 FIX: Added population here so public profiles can read follower/following list details
    // 🌟 FIX: Checked for 'profileImageUrl' instead of 'profileImage'
    const user = await User.findById(targetUserId)
      .select('-password')
      .populate([
        {
          path: 'followers',
          select: 'username displayName profileImageUrl'
        },
        {
          path: 'followingUsers',
          select: 'username displayName profileImageUrl'
        },
        {
          path: 'followingArtists'
        }
      ]);

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    const reviews = await Review.find({ user: targetUserId })
      .populate('albumID')
      .populate({
        path: 'songID',
        populate: { path: 'album' },
        options: { strictPopulate: false }
      });

    const playlists = await Playlist.find({ user: targetUserId, isPublic: true })
      .sort('-createdAt');

    res.render('publicProfile', { 
      user: user, 
      currentUser: req.session.user || null, 
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
    }).select('username displayName profileImageUrl').limit(10);

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
    const playlists = await Playlist.find({
      user: req.session.user._id
    })
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
    const playlist = await Playlist.create({
      name: req.body.name,
      description: req.body.description || '',
      isPublic:
        req.body.isPublic !== undefined
          ? req.body.isPublic
          : true,
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
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse('Playlist not found', 404));
    }

    if (
      playlist.user.toString() !==
      req.session.user._id.toString()
    ) {
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
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(new ErrorResponse('Playlist not found', 404));
    }

    if (
      playlist.user.toString() !==
      req.session.user._id.toString()
    ) {
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
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // 1. Get all song IDs belonging to the album
    const albumSongs = await Song.find({ album: req.params.albumId }).select('_id');
    const songIdsToAdd = albumSongs.map(song => song._id.toString());

    // 2. Filter: Only keep IDs not already in the playlist
    const newSongs = songIdsToAdd.filter(id => !playlist.songs.includes(id));

    if (newSongs.length === 0) {
      return res.status(200).json({ success: true, message: "No new songs to add." });
    }

    // 3. Add only the new, unique songs
    playlist.songs.push(...newSongs);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id).populate('songs');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.removeSongFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Remove the specific song ID
    playlist.songs = playlist.songs.filter(
      id => id.toString() !== req.params.songId
    );

    await playlist.save();
    
    // Populate the new 'songs' field
    const updated = await Playlist.findById(playlist._id).populate('songs');
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.addSongToPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const songId = req.params.songId;

    // Prevent duplicates
    if (playlist.songs.includes(songId)) {
      return next(new ErrorResponse('Song already in playlist', 400));
    }

    playlist.songs.push(songId);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id).populate('songs');
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// @desc    Follow another User
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.session.user._id;

    if (targetUserId === currentUserId) {
      return next(new ErrorResponse('You cannot follow your own account.', 400));
    }

    // 1. Add target user to current user's following list ($addToSet avoids duplicates)
    await User.findByIdAndUpdate(req.session.user._id, {
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
    await User.findByIdAndUpdate(req.session.user._id, { $pull: { followingUsers: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.session.user._id } });
    res.status(200).json({ success: true, message: 'Successfully unfollowed user.' });
  } catch (err) { next(err); }
};