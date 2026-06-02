const Album = require('../models/album');
const Song = require('../models/Song');
const Suggestion = require('../models/Suggestion');
const Review = require('../models/review');

exports.showAdd = async (req, res, next) => {
  try {
    let prefill = null;
    if (req.query.suggestionId) {
      prefill = await Suggestion.findById(req.query.suggestionId).lean();
    }
    res.render('admin/add', { error: null, success: false, prefill });
  } catch (err) {
    next(err);
  }
};

exports.addMusic = async (req, res, next) => {
  try {
    const { type, title, artist, year, genre, releaseDate, spotifyLink, anghamiLink, suggestionId } = req.body;

    if (!title || !artist) {
      return res.render('admin/add', { error: 'Title and Artist are required.', success: false, prefill: null });
    }

    if (type === 'album') {
      if (!req.file) {
        return res.render('admin/add', { error: 'Album cover image is required for albums.', success: false, prefill: null });
      }

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
      await Song.create({
        title,
        artists:      [artist],
        trackType:    'Standalone Single',
        album:        null,
        released:     releaseDate ? new Date(releaseDate) : new Date(),
        coverImageUrl: req.file ? `/uploads/${req.file.filename}` : '/Images/album-profile-images/epic.png',
        songLinks: {
          spotify: spotifyLink || '',
          anghami: anghamiLink || ''
        }
      });
    }

    if (suggestionId) {
      await Suggestion.findByIdAndUpdate(suggestionId, { status: 'accepted' });
    }

    res.render('admin/add', { error: null, success: true, prefill: null });
  } catch (err) {
    next(err);
  }
};

exports.showManage = async (req, res, next) => {
  try {
    const albums = await Album.find().sort({ title: 1 }).lean();
    const songs  = await Song.find().sort({ title: 1 }).lean();
    res.render('admin/manage', { albums, songs });
  } catch (err) {
    next(err);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const item = type === 'album'
      ? await Album.findById(id).lean()
      : await Song.findById(id).lean();
    if (!item) return res.redirect('/admin/manage');
    res.render('admin/edit', { type, item, error: null, success: false });
  } catch (err) {
    next(err);
  }
};

exports.updateMusic = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { title, artist, genre, releaseDate, spotifyLink, anghamiLink } = req.body;

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
        artists: [artist],
        songLinks: { spotify: spotifyLink || '', anghami: anghamiLink || '' }
      };
      if (req.file) update.coverImageUrl = `/uploads/${req.file.filename}`;
      await Song.findByIdAndUpdate(id, update);
    }

    res.redirect('/admin/manage');
  } catch (err) {
    next(err);
  }
};

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

exports.approveReview = async (req, res, next) => {
  try {
    // Review is kept as-is (approved by doing nothing — denial deletes it)
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
};

exports.denyReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
};
