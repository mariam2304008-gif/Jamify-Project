const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  artist:       { type: String, required: true },
  type:         { type: String, enum: ['album', 'song'], default: 'album' },
  year:         { type: Number },
  genre:        { type: String, default: '' },
  link:         { type: String, default: '' },
  status:       { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedByAdmin: { type: Boolean, default: false },

  
  trackType:    { type: String, enum: ['Standalone Single', 'Album Track', 'Single track'], default: 'Standalone Single' },
  albumName:    { type: String, default: '' },  
  trackNumber:  { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', suggestionSchema);
