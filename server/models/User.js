const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        default: function() {
            return this.username;
        }
    },
    phone: {
        type: String,
        required : false,
        default: ''
    },
    profileImageUrl: {
        type: String,
        default: '/Images/album-profile-images/epic.png'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    bio:{
        type: String,
        default: 'No bio yet.',
        maxlength: 300
    },
    followingUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followingArtists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

});

module.exports = mongoose.model('User', userSchema);

