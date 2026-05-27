const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    albumID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        required: true
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
    likes:{ 
        type: Number, 
        default: 0 
    }
});

module.exports = mongoose.model('Review', reviewSchema);
