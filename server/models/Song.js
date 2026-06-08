const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artists: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
},
    
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        default: null
    },
    genre: {
        type: String,
        required: true,
        trim: true,
        default: 'Pop'
    },
    
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
    
    trackNumber: {
        type: Number,
        default: null
    },
    
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    released: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount:{
        type: Number,
        default: 0
    }
});


songSchema.index({ album: 1, trackNumber: 1 });


songSchema.pre('save', async function () {
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





module.exports = mongoose.models.Song || mongoose.model('Song', songSchema);