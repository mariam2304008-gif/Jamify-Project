const Song = require('../models/Song');
const review = require('../models/review'); 
const { updateAverageRating } = require('../utils/ratingHelper');

module.exports = {
    
    getSongById: async (req, res) => {
        try {
            
            const currentSong = await Song.findById(req.params.id)
    .populate('album')
    .populate('artists');
            
           if (!currentSong) {
                return res.status(404).render('404', { message: 'Song Not Found', type: 'song' });
            }

            
            
            const reviews = await review.find({ songID: req.params.id }).populate('user');

            res.render('songProfile', { 
                song: currentSong, 
                reviews: reviews 
            });
        } catch (err) {
            if (err.name === 'CastError') {
                return res.status(404).render('404', { message: 'Song Not Found', type: 'song' });
            }
            res.status(500).send("Error loading song profile: " + err.message);
        }
    },


    
   addSongReview: async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, notLoggedIn: true });
        }

        const currentSong = await Song.findById(req.params.id);
        if (!currentSong) {
            return res.status(404).send('Song profile not found');
        }

        const newReview = new review({
            songID: req.params.id, 
            rating: parseInt(req.body.rating) || 0,
            review: req.body.review,
            date: new Date(),
            likes: [],
            
            user: req.session.user.id || req.session.user._id
        });

        await newReview.save();
        await updateAverageRating(req.params.id, 'Song');
        
        res.json({ success: true });
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

            
            if (!song.likes) song.likes = [];

            const hasLiked = song.likes.includes(userId);
            if (hasLiked) {
                
                await Song.findByIdAndUpdate(songId, { $pull: { likes: userId } });
            } else {
                
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

    
    toggleReviewLike: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const userId = req.session.user.id || req.session.user._id;

            const targetReview = await review.findById(reviewId);
            if (!targetReview) return res.status(404).json({ success: false, message: "Review comment not found" });

            
            let hasLiked = false;
            if (Array.isArray(targetReview.likes)) {
                hasLiked = targetReview.likes.includes(userId);
                if (hasLiked) {
                    await review.findByIdAndUpdate(reviewId, { $pull: { likes: userId } });
                } else {
                    await review.findByIdAndUpdate(reviewId, { $addToSet: { likes: userId } });
                }
            } else {
                
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