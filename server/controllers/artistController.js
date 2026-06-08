const Artist = require('../models/Artist');
const Album = require('../models/album');
const Song = require('../models/Song');
const ErrorResponse = require('../utils/errorResponse');




exports.getArtists = async (req, res, next) => {
  try {
    const artists = await Artist.find().sort('name');
    res.status(200).json({ success: true, count: artists.length, data: artists });
  } catch (err) {
    next(err);
  }
};




exports.getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).render('404', { message: 'Artist Not Found', type: 'artist' });
    }

    
    const albums = await Album.find({ artist: artist._id });

    
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




exports.createArtist = async (req, res, next) => {
  try {
    if (req.file) req.body.image = `/uploads/${req.file.filename}`;
    const artist = await Artist.create(req.body);
    res.redirect('/admin/add');
  } catch (err) {
    next(err);
  }
};




exports.followArtist = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            return res.status(404).json({ success: false, message: 'Artist not found' });
        }

        const currentUserId = req.user && (req.user._id || req.user.id);
        if (!currentUserId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const existingFollower = artist.followers.some(
            follower => follower.toString() === currentUserId.toString()
        );

        if (!existingFollower) {
            artist.followers.push(currentUserId);
            await artist.save();
        }

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};




exports.unfollowArtist = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            return res.status(404).json({ success: false, message: 'Artist not found' });
        }

        const currentUserId = req.user && (req.user._id || req.user.id);
        if (!currentUserId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        artist.followers = artist.followers.filter(
            follower => follower.toString() !== currentUserId.toString()
        );

        await artist.save();

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};




exports.toggleArtistLike = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            return res.status(404).json({ success: false, message: 'Artist not found' });
        }

        const currentUserId = req.user && (req.user._id || req.user.id);
        if (!currentUserId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!artist.likes) {
            artist.likes = [];
        }

        const hasLiked = artist.likes.some(
            like => like.toString() === currentUserId.toString()
        );

        if (hasLiked) {
            artist.likes = artist.likes.filter(
                like => like.toString() !== currentUserId.toString()
            );
        } else {
            artist.likes.push(currentUserId);
        }

        await artist.save();

        res.json({
            success: true,
            hasLiked: !hasLiked,
            likeCount: artist.likes.length
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
