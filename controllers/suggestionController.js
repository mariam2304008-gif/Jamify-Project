const Suggestion = require('../models/Suggestion');

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
    const { type, title, artist, year, genre, link } = req.body;
    if (!title || !artist) return res.redirect('/suggestions');

    await Suggestion.create({
      title,
      artist,
      type: type || 'album',
      year: year ? parseInt(year) : undefined,
      genre,
      link,
      submittedBy: req.session.user._id
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
