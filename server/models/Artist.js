const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an artist name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters'],
    default: ''
  },
  image: {
    type: String,
    default: 'Images/album-profile-images/epic.png'
  },
  genre: {
    type: String,
    default: 'Pop'
  },
  country: {
    type: String,
    default: ''
  },
  spotifyUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}]

}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get all albums by this artist
ArtistSchema.virtual('albums', {
  ref: 'Album',
  localField: 'name',
  foreignField: 'artist',
  justOne: false
});

module.exports = mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
