const Album = require('../models/album');
const Suggestion = require('../models/Suggestion');
const Review = require('../models/review');

exports.showAdd = (req, res) => {
  res.render('admin/add', { error: null, success: !!req.query.success });
};

exports.addMusic = async (req, res, next) => {
  try {
    const { type, title, artist, year, genre, releaseDate, spotifyLink, anghamiLink } = req.body;

    if (!title || !artist) {
      return res.render('admin/add', { error: 'Title and Artist are required.', success: false });
    }

    if (type === 'album') {
      if (!req.file) {
        return res.render('admin/add', { error: 'Album cover image is required for albums.', success: false });
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
      await Suggestion.create({
        title,
        artist,
        type: 'song',
        year: year ? parseInt(year) : undefined,
        genre,
        submittedBy:  req.session.user.id,
        addedByAdmin: true,
        status:       'accepted'
      });
    }

    res.render('admin/add', { error: null, success: true });
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
