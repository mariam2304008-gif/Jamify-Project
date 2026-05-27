const album = require('../models/album');
const review = require('../models/review');

module.exports = {
    getAllAlbums: async (req, res) => {
        try {
            const allAlbums = await album.find({});
            res.render('index', { albums: allAlbums });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getAlbumById: async (req, res) => {
        try {
            const currentAlbum = await album.findById(req.params.id);
            if (!currentAlbum) {
                return res.status(404).json({ message: 'Album not found' });
            }
            const reviews = await review.find({ albumID: req.params.id }).populate('user');
            res.render('albumProfile', { album: currentAlbum, reviews: reviews });
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
    addReview: async (req, res) => {
        try {
            const currentAlbum = await album.findById(req.params.id);
            if (!currentAlbum) {
                return res.status(404).json({ message: 'Album not found' });
            }
            const newReview = new review({
                albumID: req.params.id,
                rating: parseInt(req.body.rating),
                review: req.body.review,
                date: new Date(),
                likes: 0,
                user: req.body.user || "65af3b23c12a4b567890abcd"
            });
            await newReview.save();
            res.redirect(`/albums/${req.params.id}`);
        } catch (err) {
            res.status(400).send("Error Saving Review: " + err.message);
        }
    }
};