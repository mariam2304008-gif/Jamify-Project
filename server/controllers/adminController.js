const Album = require('../models/album');
const Song = require('../models/Song');
const Suggestion = require('../models/Suggestion');
const Review = require('../models/review');

exports.showAdd = async (req, res, next) => {
  try {
    const Artist = require('../models/Artist');
    let prefill = null;
    if (req.query.suggestionId) {
      prefill = await Suggestion.findById(req.query.suggestionId).lean();
    }
    const albums = await Album.find().sort({ title: 1 }).lean();
    const albums_artists = await Artist.find().sort({ name: 1 }).lean();
    res.render('admin/add', { error: null, success: false, prefill, albums, albums_artists });
  } catch (err) {
    next(err);
  }
};


exports.addMusic = async (req, res, next) => {
  try {
    const Artist = require('../models/Artist');

    const { type, title, artist, year, genre, releaseDate, spotifyLink, anghamiLink, suggestionId, albumId, trackNumber } = req.body;

    const albums = await Album.find().sort({ title: 1 }).lean();
    const albums_artists = await Artist.find().sort({ name: 1 }).lean();

    if (!title || !artist) {
      return res.render('admin/add', { error: 'Title and Artist are required.', success: false, prefill: null, albums, albums_artists });
    }

    if (!spotifyLink && !anghamiLink) {
      return res.render('admin/add', { error: 'At least one link (Spotify or Anghami) is required.', success: false, prefill: null, albums, albums_artists });
    }

    if (!req.file && (type !== 'song' || !albumId)) {
      return res.render('admin/add', { error: 'Cover image is required.', success: false, prefill: null, albums, albums_artists });
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

    res.render('admin/add', { error: null, success: true, prefill: null, albums, albums_artists });
  } catch (err) {
    next(err);
  }
};


exports.showManage = async (req, res, next) => {
  try {
    const Artist = require('../models/Artist');
    const albums  = await Album.find().sort({ title: 1 }).populate('artist', 'name').lean();
    const songs   = await Song.find().sort({ title: 1 }).populate('artists', 'name').lean();
    const artists = await Artist.find().sort({ name: 1 }).lean();
    res.render('admin/manage', { albums, songs, artists });
  } catch (err) {
    next(err);
  }
};


exports.showEdit = async (req, res, next) => {
  try {
    const Artist = require('../models/Artist');
    const { type, id } = req.params;
    let item;
    if (type === 'album')       item = await Album.findById(id).lean();
    else if (type === 'song')   item = await Song.findById(id).lean();
    else if (type === 'artist') item = await Artist.findById(id).lean();
    if (!item) return res.redirect('/admin/manage');
    const albums  = await Album.find().sort({ title: 1 }).lean();
    const artists = await Artist.find().sort({ name: 1 }).lean();
    res.render('admin/edit', { type, item, error: null, success: false, albums, artists });
  } catch (err) {
    next(err);
  }
};


exports.updateMusic = async (req, res, next) => {
  try {
    const Artist = require('../models/Artist');
    const { type, id } = req.params;
    const { title, artist, genre, releaseDate, spotifyLink, anghamiLink, albumId, trackNumber,
            name, bio, country, spotifyUrl } = req.body;

    if (type === 'artist') {
      const update = { name, bio: bio || '', genre: genre || '', country: country || '', spotifyUrl: spotifyUrl || '' };
      if (req.file) update.image = `/uploads/${req.file.filename}`;
      await Artist.findByIdAndUpdate(id, update);
      return res.redirect('/admin/manage');
    }

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


exports.deleteMusic = async (req, res, next) => {
  try {
    const Artist = require('../models/Artist');
    const { type, id } = req.params;
    if (type === 'album')       await Album.findByIdAndDelete(id);
    else if (type === 'song')   await Song.findByIdAndDelete(id);
    else if (type === 'artist') await Artist.findByIdAndDelete(id);
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
    
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
};


exports.denyReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    const redirectTarget = req.body.redirect || req.query.redirect || '/admin/reviews';
    res.redirect(redirectTarget);
  } catch (err) {
    next(err);
  }
};
