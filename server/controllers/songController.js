const Song = require('../models/Song');
const review = require('../models/review'); // Match your lowercase review import

module.exports = {
    // GET /songs/:id -> Render individual song profile page
    getSongById: async (req, res) => {
        try {
            // Fetch the song document and deeply populate the parent album data if it exists
            const currentSong = await Song.findById(req.params.id).populate('album');
            
            if (!currentSong) {
                return res.status(404).send('Song profile not found');
            }

            // Fetch all reviews linked specifically to this song ID
            // NOTE: Make sure your review model schema can accept a songID field!
            const reviews = await review.find({ songID: req.params.id }).populate('user');

            res.render('songProfile', { 
                song: currentSong, 
                reviews: reviews 
            });
        } catch (err) {
            res.status(500).send("Error loading song profile: " + err.message);
        }
    },


    
    // POST /songs/:id/reviews -> Create a track review submission
    addSongReview: async (req, res) => {
        try {
            const currentSong = await Song.findById(req.params.id);
            if (!currentSong) {
                return res.status(404).send('Song profile not found');
            }

            // Create a review document mapped to this specific song
            const newReview = new review({
                songID: req.params.id, // Attaches review to the track asset container
                rating: parseInt(req.body.rating),
                review: req.body.review,
                date: new Date(),
                likes: 0,
                // Tie to logged-in session user ID, fallback to fallback placeholder if unauthenticated
                user: req.session && req.session.user ? req.session.user.id : "65af3b23c12a4b567890abcd"
            });

            await newReview.save();
            
            // Redirect the client browser back to refresh the current song profile page smooth view
            res.redirect(`/songs/${req.params.id}`);
        } catch (err) {
            res.status(400).send("Error Saving Track Review: " + err.message);
        }
    },
    toggleSongLike: async (req, res) => {
        try {
            const songId = req.params.id;
            const userId = req.session.user.id || req.session.user._id;

            const song = await Song.findById(songId);
            if (!song) return res.status(404).json({ success: false, message: "Song document not found" });

            // Initialize as empty array if missing
            if (!song.likes) song.likes = [];

            const hasLiked = song.likes.includes(userId);
            if (hasLiked) {
                // If user already liked it, pull them out of the array
                await Song.findByIdAndUpdate(songId, { $pull: { likes: userId } });
            } else {
                // Else, push their ID cleanly into the array
                await Song.findByIdAndUpdate(songId, { $addToSet: { likes: userId } });
            }

            const updatedSong = await Song.findById(songId);
            return res.json({ 
                success: true, 
                likeCount: updatedSong.likes ? updatedSong.likes.length : 0, 
                hasLiked: !hasLiked 
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error changing song favorite trace" });
        }
    },

    // POST /songs/reviews/:reviewId/like -> Toggle user like inside comment loop arrays
    toggleReviewLike: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const userId = req.session.user.id || req.session.user._id;

            const targetReview = await review.findById(reviewId);
            if (!targetReview) return res.status(404).json({ success: false, message: "Review comment not found" });

            // If your legacy schema seeds likes as a simple number instead of an array, fix it safely
            let hasLiked = false;
            if (Array.isArray(targetReview.likes)) {
                hasLiked = targetReview.likes.includes(userId);
                if (hasLiked) {
                    await review.findByIdAndUpdate(reviewId, { $pull: { likes: userId } });
                } else {
                    await review.findByIdAndUpdate(reviewId, { $addToSet: { likes: userId } });
                }
            } else {
                // Fallback for primitive numeric count fields if arrays haven't migrated completely yet
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
            return res.status(500).json({ success: false, message: "Error mutating comment review metric" });
        }
    }
};