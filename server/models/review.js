const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    albumID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        required: true
    },
    songID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    review: {
        type: String,
        maxlength: 260,
        required: true
    },
    date:{ 
        type: Date,
        required: true,
    },
    likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
}]
});

module.exports = mongoose.model('Review', reviewSchema);
