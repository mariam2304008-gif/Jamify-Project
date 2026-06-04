const mongoose = require('mongoose');


const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    releaseDate:{
        type: Date,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    reviewCount:{
        type: Number,
        default: 0
    },
    albumLinks: {
        spotify: {
            type: String
        },
        anghami: {
            type: String
        }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
}]
});


module.exports = mongoose.models.Album || mongoose.model('Album', albumSchema);