const Album = require('../models/album');
const Song = require('../models/Song');
const Suggestion = require('../models/Suggestion');
const Review = require('../models/review');

//Function 1
exports.showAdd = async (req, res, next) => {
  try {
    let prefill = null;
    if (req.query.suggestionId) {
      prefill = await Suggestion.findById(req.query.suggestionId).lean();
    }
    const albums = await Album.find().sort({ title: 1 }).lean();
    res.render('admin/add', { error: null, success: false, prefill, albums });
  } catch (err) {
    next(err);
  }
};

//Function 2
exports.addMusic = async (req, res, next) => {
  try {
    const { type, title, artist, year, genre, releaseDate, spotifyLink, anghamiLink, suggestionId, albumId, trackNumber } = req.body;

    const albums = await Album.find().sort({ title: 1 }).lean();

    if (!title || !artist) {
      return res.render('admin/add', { error: 'Title and Artist are required.', success: false, prefill: null, albums });
    }

    if (!spotifyLink && !anghamiLink) {
      return res.render('admin/add', { error: 'At least one link (Spotify or Anghami) is required.', success: false, prefill: null, albums });
    }

    if (!req.file && (type !== 'song' || !albumId)) {
      return res.render('admin/add', { error: 'Cover image is required.', success: false, prefill: null, albums });
    }

    if (type === 'album') {

      await Album.create({
        title,
        artist,
        genre:        genre        || '',
        releaseDate:  releaseDate  || (year ? String(year) : ''),
        coverImageUrl: `/uploads/${req.file.filename}`,
        albumLinks: {
          spotify: spotifyLink || '',
          anghami: anghamiLink || ''
        }
      });

    } else {
      const song = await Song.create({
        title,
        artists:      [artist],
        trackType:    albumId ? 'Album Track' : 'Standalone Single',
        album:        albumId || null,
        trackNumber:  trackNumber ? Number(trackNumber) : null,
        genre:        genre || '',
        released:     releaseDate ? new Date(releaseDate) : new Date(),
        coverImageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        songLinks: {
          spotify: spotifyLink || '',
          anghami: anghamiLink || ''
        }
      });

      if (albumId) {
        await Album.findByIdAndUpdate(albumId, { $addToSet: { songs: song._id } });
      }
    }

    if (suggestionId) {
      await Suggestion.findByIdAndUpdate(suggestionId, { status: 'accepted' });
    }

    res.render('admin/add', { error: null, success: true, prefill: null, albums });
  } catch (err) {
    next(err);
  }
};

// Function 3
exports.showManage = async (req, res, next) => {
  try {
    const albums = await Album.find().sort({ title: 1 }).lean();
    const songs  = await Song.find().sort({ title: 1 }).lean();
    res.render('admin/manage', { albums, songs });
  } catch (err) {
    next(err);
  }
};

//Function 4
exports.showEdit = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const item = type === 'album'
      ? await Album.findById(id).lean()
      : await Song.findById(id).lean();
    if (!item) return res.redirect('/admin/manage');
    const albums = await Album.find().sort({ title: 1 }).lean();
    res.render('admin/edit', { type, item, error: null, success: false, albums });
  } catch (err) {
    next(err);
  }
};

// Function 5
exports.updateMusic = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { title, artist, genre, releaseDate, spotifyLink, anghamiLink, albumId, trackNumber } = req.body;

    if (type === 'album') {
      const update = {
        title, artist, genre,
        releaseDate: releaseDate || '',
        albumLinks: { spotify: spotifyLink || '', anghami: anghamiLink || '' }
      };
      if (req.file) update.coverImageUrl = `/uploads/${req.file.filename}`;
      await Album.findByIdAndUpdate(id, update);
    } else {
      const update = {
        title,
        artists:     [artist],
        genre:       genre || '',
        album:       albumId || null,
        trackNumber: trackNumber ? Number(trackNumber) : null,
        trackType:   albumId ? 'Album Track' : 'Standalone Single',
        songLinks:   { spotify: spotifyLink || '', anghami: anghamiLink || '' }
      };
      if (releaseDate) update.released = new Date(releaseDate);
      if (req.file) update.coverImageUrl = `/uploads/${req.file.filename}`;
      if (albumId && !req.file && !update.coverImageUrl) {
        const parentAlbum = await Album.findById(albumId).lean();
        if (parentAlbum && parentAlbum.coverImageUrl) update.coverImageUrl = parentAlbum.coverImageUrl;
      }
      await Song.findByIdAndUpdate(id, update);
    }

    res.redirect('/admin/manage');
  } catch (err) {
    next(err);
  }
};

//Function 6
exports.deleteMusic = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    if (type === 'album') {
      await Album.findByIdAndDelete(id);
    } else {
      await Song.findByIdAndDelete(id);
    }
    res.redirect('/admin/manage');
  } catch (err) {
    next(err);
  }
};

//Function 7
exports.reviewIndex = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'displayName username')
      .populate('albumID', 'title')
      .sort({ date: -1 })
      .lean();
    res.render('reviewadmin', { reviews });
  } catch (err) {
    next(err);
  }
};

// Function 8
exports.approveReview = async (req, res, next) => {
  try {
    // Review is kept as-is (approved by doing nothing — denial deletes it)
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
};

//Function 9
exports.denyReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    const redirectTarget = req.body.redirect || req.query.redirect || '/admin/reviews';
    res.redirect(redirectTarget);
  } catch (err) {
    next(err);
  }
};
