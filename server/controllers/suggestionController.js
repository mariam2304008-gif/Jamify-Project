const Suggestion = require('../models/Suggestion');
const Album = require('../models/album');
const Song = require('../models/Song');

exports.index = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find({ submittedBy: req.session.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.render('suggest', { suggestions, flash: req.query.success });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { type, title, artist, year, genre, link, trackType, albumName, trackNumber } = req.body;
    if (!title || !artist) return res.redirect('/suggest');
    if (link && !/^https?:\/\/.+/.test(link.trim())) return res.redirect('/suggest');
    if (genre && /\d/.test(genre)) return res.redirect('/suggest');

    await Suggestion.create({
      title,
      artist,
      type:        type || 'album',
      year:        year ? parseInt(year) : undefined,
      genre,
      link,
      submittedBy: req.session.user.id,
      trackType:   type === 'song' ? (trackType || 'Standalone Single') : undefined,
      albumName:   type === 'song' ? (albumName || '') : undefined,
      trackNumber: type === 'song' && trackNumber ? parseInt(trackNumber) : undefined
    });

    res.redirect('/suggestions?success=1');
  } catch (err) {
    next(err);
  }
};

// Admin: list all suggestions with optional status filter
exports.adminIndex = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const suggestions = await Suggestion.find(filter)
      .populate('submittedBy', 'displayName username')
      .sort({ createdAt: -1 })
      .lean();
    res.render('admin/suggestions', { suggestions, activeFilter: status || 'all' });
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) return next(new Error('Suggestion not found'));

    if (suggestion.type === 'album') {
      const existing = await Album.findOne({ title: suggestion.title, artist: suggestion.artist });
      if (!existing) {
        await Album.create({
          title:        suggestion.title,
          artist:       suggestion.artist,
          genre:        suggestion.genre || 'Unknown',
          releaseDate:  suggestion.year ? new Date(`${suggestion.year}-01-01`) : new Date(),
          coverImageUrl: '/Images/album-profile-images/epic.png',
          albumLinks: {
            spotify: suggestion.link || '',
            anghami: ''
          }
        });
      }
    } else if (suggestion.type === 'song') {
      let albumId = null;

      // If the song belongs to an album, look it up by name
      if (
        (suggestion.trackType === 'Album Track' || suggestion.trackType === 'Single track') &&
        suggestion.albumName
      ) {
        const parentAlbum = await Album.findOne({ title: new RegExp(`^${suggestion.albumName}$`, 'i') });
        if (parentAlbum) albumId = parentAlbum._id;
      }

      const newSong = await Song.create({
        title:       suggestion.title,
        artists:     [suggestion.artist],
        trackType:   suggestion.trackType || 'Standalone Single',
        album:       albumId,
        trackNumber: suggestion.trackNumber || null,
        released:    suggestion.year ? new Date(`${suggestion.year}-01-01`) : new Date(),
        songLinks: {
          spotify: suggestion.link || '',
          anghami: ''
        }
      });

      // If linked to an album, add this song to the album's tracklist
      if (albumId) {
        await Album.findByIdAndUpdate(albumId, { $addToSet: { songs: newSong._id } });
      }
    }

    await Suggestion.findByIdAndUpdate(req.params.id, { status: 'accepted' });
    res.redirect('/admin/suggestions');
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    await Suggestion.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.redirect('/admin/suggestions');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) return res.redirect('/suggest');
    if (suggestion.submittedBy.toString() !== req.session.user.id) return res.redirect('/suggest');
    if (suggestion.status !== 'pending') return res.redirect('/suggest');

    await Suggestion.findByIdAndDelete(req.params.id);
    res.redirect('/suggest');
  } catch (err) {
    next(err);
  }
};
