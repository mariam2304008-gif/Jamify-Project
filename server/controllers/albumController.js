const album = require('../models/album');
const review = require('../models/review');
const Song = require('../models/Song'); 
const {updateAverageRating}  = require('../utils/ratingHelper');

module.exports = {
    getAllAlbums: async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;

        const limit = 3;

        const skip = (page - 1) * limit;

        const filter = {
            trackType: {
                $nin: [
                    'Standalone Single',
                    'Single track',
                    'Single'
                ]
            }
        };

        const totalAlbums = await album.countDocuments(filter);

        const paginatedAlbums = await album.find(filter)
            .skip(skip)
            .limit(limit);

        const combinedSingles = await Song.find({
            $or: [
                { album: null },
                { trackType: 'Standalone Single' },
                { trackType: 'Single track' }
            ]
        });

        const totalPages = Math.ceil(totalAlbums / limit);

        res.render('index', {
            albums: paginatedAlbums,
            standaloneSongs: combinedSingles,
            currentPage: page,
            totalPages
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
},

    // FIXED: Now populates the nested song objects to prevent .join() crashes in EJS!
    getAlbumById: async (req, res) => {
        try {
            // .populate('songs') matches your updated models/album.js schema definition
            const currentAlbum = await album.findById(req.params.id).populate('songs');
            
            if (!currentAlbum) {
                return res.status(404).json({ message: 'Album not found' });
            }

            // Fetch all reviews linked to this album
            const reviews = await review.find({ albumID: req.params.id }).populate('user');

            // Fallback tracklist sorting check
            const tracklist = currentAlbum.songs && currentAlbum.songs.length > 0 
                ? currentAlbum.songs.sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))
                : await Song.find({ album: req.params.id }).sort({ trackNumber: 1 });

            // Pass the variables into your albumProfile.ejs template cleanly
            res.render('albumProfile', { 
                album: currentAlbum, 
                reviews: reviews,
                tracklist: tracklist 
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    createAlbum: async (req, res) => {
        const newAlbum = new album({
            title: req.body.title,
            artist: req.body.artist,
            releaseDate: req.body.releaseDate,
            genre: req.body.genre,
            coverImageUrl: req.body.coverImageUrl,
            rating: req.body.rating,
            albumLinks: req.body.albumLinks,
            likes: req.body.likes
        });
        try {
            const savedAlbum = await newAlbum.save();
            res.status(201).json(savedAlbum);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    updateAlbum: async (req, res) => {
        try {
            const updatedAlbum = await album.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedAlbum) {
                return res.status(404).json({ message: 'Album not found' });
            }
            res.json(updatedAlbum);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    deleteAlbum: async (req, res) => {
        try {
            const deletedAlbum = await album.findByIdAndDelete(req.params.id);
            if (!deletedAlbum) {
                return res.status(404).json({ message: 'Album not found' });
            }
            res.json({ message: 'Album deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // FIXED: Cleaned up to properly map to your updated Review database schema configuration
   addReview: async (req, res) => {
    try {
        // 1. Check if the user is authenticated. If not, send them to the login page!
        if (!req.session || !req.session.user) {
            return res.redirect('/login'); 
        }

        const currentAlbum = await album.findById(req.params.id);
        if (!currentAlbum) {
            return res.status(404).json({ message: 'Album not found' });
        }
        
        const newReview = new review({
            albumID: req.params.id, 
            rating: parseInt(req.body.rating) || 0,
            review: req.body.review, 
            date: new Date(),
            likes: [],
            // Safe to access now because we verified the session above
            user: req.session.user.id || req.session.user._id
        });
        
        await newReview.save();
        await updateAverageRating(req.params.id, 'Album');
        
        res.redirect(`/albums/${req.params.id}`);
    } catch (err) {
        res.status(400).send("Error Saving Review: " + err.message);
    }
},

    deleteReview: async (req, res, next) => {
        try {
            const currentReview = await review.findById(req.params.id);
            if (!currentReview) {
                return res.status(404).send('Review not found');
            }

            const currentUserId = req.user && req.user._id ? req.user._id.toString() : null;
            const reviewOwnerId = currentReview.user ? currentReview.user.toString() : null;

            if (!currentUserId || (currentUserId !== reviewOwnerId && !req.user.isAdmin)) {
                return res.status(403).send('You are not allowed to delete this review');
            }

            // 1. Capture both asset IDs before deleting the document from the DB
            const targetAlbumId = currentReview.albumID;
            const targetSongId = currentReview.songID;

            // 2. Destroy the review document
            await review.findByIdAndDelete(req.params.id);

            // 3. Conditional Recalculation Check
            if (targetAlbumId) {
                // If it was an album review, recalculate album metrics
                await updateAverageRating(targetAlbumId, 'Album');
            } else if (targetSongId) {
                // If it was a song review, recalculate song metrics
                await updateAverageRating(targetSongId, 'Song');
            }
            
            const redirectTarget = req.body.redirect || req.query.redirect || '/';
            res.redirect(redirectTarget);
        } catch (err) {
            next(err);
        }
    },

    toggleAlbumLike: async (req, res) => {
        try {
            const albumId = req.params.id;
            const userId = req.session.user.id || req.session.user._id;

            const currentAlbum = await album.findById(albumId);
            if (!currentAlbum) return res.status(404).json({ success: false, message: "Album not found" });

            // Fail-safe initialization for arrays
            if (!Array.isArray(currentAlbum.likes)) {
                currentAlbum.likes = [];
            }

            const hasLiked = currentAlbum.likes.includes(userId);
            if (hasLiked) {
                await album.findByIdAndUpdate(albumId, { $pull: { likes: userId } });
            } else {
                await album.findByIdAndUpdate(albumId, { $addToSet: { likes: userId } });
            }

            const updatedAlbum = await album.findById(albumId);
            return res.json({ 
                success: true, 
                likeCount: updatedAlbum.likes.length, 
                hasLiked: !hasLiked 
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error changing album favorite trace" });
        }
    },

    // 8. POST /albums/reviews/:reviewId/like -> Toggle user like inside album review comment loops
    toggleAlbumReviewLike: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const userId = req.session.user.id || req.session.user._id;

            const targetReview = await review.findById(reviewId);
            if (!targetReview) return res.status(404).json({ success: false, message: "Review not found" });

            let hasLiked = false;
            if (Array.isArray(targetReview.likes)) {
                hasLiked = targetReview.likes.includes(userId);
                if (hasLiked) {
                    await review.findByIdAndUpdate(reviewId, { $pull: { likes: userId } });
                } else {
                    await review.findByIdAndUpdate(reviewId, { $addToSet: { likes: userId } });
                }
            } else {
                // Fallback for legacy database counters
                await review.findByIdAndUpdate(reviewId, { $inc: { likes: 1 } });
            }

            const updatedReview = await review.findById(reviewId);
            const count = Array.isArray(updatedReview.likes) ? updatedReview.likes.length : updatedReview.likes;

            return res.json({ 
                success: true, 
                likeCount: count, 
                hasLiked: !hasLiked 
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error mutating review metric" });
         }
},
searchAlbums: async (req, res) => {
    try {
        const q = req.query.q;

        const albums = await album.find({
            title: { $regex: q, $options: 'i' }
        }).limit(10);

        res.json({
            success: true,
            data: albums
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false
        });
    }
}
};
