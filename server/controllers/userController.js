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

    const user = await User.findById(userId).populate([
      {
        path: 'followers',
        select: 'username displayName profileImageUrl' 
      },
      {
        path: 'followingUsers', 
        select: 'username displayName profileImageUrl'
      },
      {
        path: 'followingArtists',
        select: 'name image'
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



exports.updateProfile = async (req, res, next) => {
  try {
    
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Not authorized, session expired.' });
    }
    
    const userId = req.session.user.id;
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
    
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, error: err.message || "Server error while saving profile" });
  }
};




exports.getPublicProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (req.session && req.session.user) {
      const loggedInId = req.session.user._id || req.session.user.id;
      if (loggedInId && loggedInId.toString() === targetUserId) {
        return res.redirect('/profile'); 
      }
    }

    
    
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
    return res.status(404).render('404', { message: 'User Not Found', type: 'user' });
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
      profileUser: user, 
      currentUser: req.session.user || null, 
      reviews: reviews, 
      playlists: playlists,
      reviewCount: reviews.length,     
      playlistCount: playlists.length   
    });

} catch (err) {
    if (err.name === 'CastError') {
        return res.status(404).render('404', { message: 'User Not Found', type: 'user' });
    }
    next(err);
  }
};



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




exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};




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
      user: req.session.user._id,
songs: []
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
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    
    const albumSongs = await Song.find({ album: req.params.albumId }).select('_id');
    const songIdsToAdd = albumSongs.map(song => song._id.toString());

    
    
const existingSongIds = playlist.songs.map(song =>
  song.toString()
);

const newSongs = songIdsToAdd.filter(
  id => !existingSongIds.includes(id)
);

    if (newSongs.length === 0) {
      return res.status(200).json({ success: true, message: "No new songs to add." });
    }

    
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
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    
    playlist.songs = playlist.songs.filter(
      id => id.toString() !== req.params.songId
    );

    await playlist.save();
    
    
    const updated = await Playlist.findById(playlist._id).populate('songs');
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.addSongToPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) return next(new ErrorResponse('Playlist not found', 404));

    if (playlist.user.toString() !== req.session.user._id.toString()) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const songId = req.params.songId;

    
    if (playlist.songs.includes(songId)) {
      return next(new ErrorResponse('Song already in playlist', 400));
    }

    playlist.songs.push(songId);
    await playlist.save();

    const updated = await Playlist.findById(playlist._id).populate('songs');
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};




exports.followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.session.user._id;

    if (targetUserId === currentUserId) {
      return next(new ErrorResponse('You cannot follow your own account.', 400));
    }

    
    await User.findByIdAndUpdate(req.session.user._id, {
      $addToSet: { followingUsers: targetUserId }
    });

    
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    res.status(200).json({ success: true, message: 'Successfully followed user.' });
  } catch (err) { next(err); }
};




exports.unfollowUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.session.user._id, { $pull: { followingUsers: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.session.user._id } });
    res.status(200).json({ success: true, message: 'Successfully unfollowed user.' });
  } catch (err) { next(err); }
};