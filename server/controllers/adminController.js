const Album = require('../models/Album');
const Suggestion = require('../models/Suggestion');
const Review = require('../models/Review');

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

      // Build a URL-safe slug from title + artist
      let slug = (title + '-' + artist)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Ensure slug is unique
      const existing = await Album.findOne({ slug });
      if (existing) slug = slug + '-' + Date.now();

      await Album.create({
        title,
        artist,
        slug,
        image: req.file.filename,
        genre:       genre       || '',
        releaseDate: releaseDate || (year ? String(year) : ''),
        spotifyLink: spotifyLink || '',
        anghamiLink: anghamiLink || ''
      });

    } else {
      // Songs are stored as accepted suggestions (no Album doc needed)
      await Suggestion.create({
        title,
        artist,
        type: 'song',
        year: year ? parseInt(year) : undefined,
        genre,
        submittedBy:  req.session.user._id,
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
    const reviews = await Review.find({ status: 'pending' })
      .populate('submittedBy', 'displayName username')
      .populate('album', 'title')
      .sort({ createdAt: -1 })
      .lean();
    res.render('admin/reviewadmin', { reviews });
  } catch (err) {
    next(err);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
};

exports.denyReview = async (req, res, next) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { status: 'denied' });
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
};
