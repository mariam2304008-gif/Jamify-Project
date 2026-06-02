const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    // Array of strings to support solo artists, collaborations, or features
    artists: [{
        type: String,
        required: true
    }],
    // Optional reference: If null, it's a Standalone Single!
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        default: null
    },
    // Track type logic indicator
    trackType: {
        type: String,
        enum: ['Album Track', 'Single track', 'Standalone Single'],
        required: true,
        default: 'Album Track'
    },
    songLinks: {
        spotify: {
            type: String,
            default: ''
        },
        anghami: {
            type: String,
            default: ''
        }
    },
    coverImageUrl: { 
        type: String, 
        default: '' 
    },
    // Track number on the album (null if standalone single)
    trackNumber: {
        type: Number,
        default: null
    },
    // Dynamic metrics
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    released: {
        type: Date,
        default:  Date.now
    }
});

// Indexing trackNumber makes sorting album tracklists incredibly fast later
songSchema.index({ album: 1, trackNumber: 1 });

// DYNAMIC PRE-SAVE HOOK: In models/Song.js
songSchema.pre('save', async function() {
    if (this.album) {
        try {
            const Album = mongoose.model('Album');
            const parentAlbum = await Album.findById(this.album);

            if (parentAlbum) {
                this.released = parentAlbum.releaseDate || parentAlbum.released;
                if (!this.coverImageUrl && parentAlbum.coverImageUrl) {
                    this.coverImageUrl = parentAlbum.coverImageUrl;
                }
            }
        } catch (err) {
            console.error("Error in Song pre-save hook middleware:", err.message);
            throw err;
        }
    }

    if (!this.coverImageUrl) {
        this.coverImageUrl = '/Images/album-profile-images/default-single.png';
    }
});





module.exports = mongoose.model('Song', songSchema, 'songs');