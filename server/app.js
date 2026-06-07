console.log('Starting app.js...');

const path = require('path');
console.log('Loaded path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('Loaded dotenv');

const express = require('express');
console.log('Loaded express');

const mongoose = require('mongoose');
console.log('Loaded mongoose');

const session = require('express-session');
console.log('Loaded session');

const dbURL = process.env.DATABASE_URL;
console.log('Got DATABASE_URL:', dbURL ? 'set' : 'not set');

const albumController = require('./controllers/albumController');
console.log('Loaded albumController');

const suggestionController = require('./controllers/suggestionController');
console.log('Loaded suggestionController');

const { getProfile } = require('./controllers/userController');
console.log('Loaded userController');

const authRoutes = require('./routes/auth');
console.log('Loaded authRoutes');

const isLoggedIn = require('./middleware/isLoggedIn');
console.log('Loaded isLoggedIn');

const isAdmin = require('./middleware/isAdmin');
console.log('Loaded isAdmin');

const songRoutes = require('./routes/songs');
console.log('Loaded songRoutes');

const searchRoutes = require('./routes/search');
console.log('Loaded searchRoutes');

const app = express();
const port = 3000;

console.log('Creating app...');

// Setup Template Engine & Parsers
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

console.log('Set up middleware...');

// 1. Session Configuration (Must be initialized BEFORE routes!)
app.use(session({
    secret: 'jamify-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

const User = require('./models/User');
console.log('Loaded User model');

app.use(async (req, res, next) => {

    res.locals.user = null;

    if (req.session && req.session.user) {

        try {

            const dbUser = await User.findById(req.session.user._id);

            if (dbUser) {

                res.locals.user = dbUser;

                req.user = dbUser;
            }

        } catch (err) {

            console.error(err);
        }
    }

    next();
});

const albumRoutes = require('./routes/albums');
console.log('Loaded albumRoutes');

const suggestionRoutes = require('./routes/suggestions');
console.log('Loaded suggestionRoutes');

const userRoutes = require('./routes/users');
console.log('Loaded userRoutes');

const adminRoutes = require('./routes/admin');
console.log('Loaded adminRoutes');

const artistRoutes = require('./routes/artists');
console.log('Loaded artistRoutes');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

console.log('Set up health check...');

// 2. Route Routing Middlewares
app.use('/albums', albumRoutes);
app.use('/songs', songRoutes);
app.use('/admin', adminRoutes);
app.use('/api', authRoutes); // Handles POST /api/login and POST /api/signup

app.use('/api/artists', artistRoutes);
app.use('/artists', artistRoutes);
app.use('/suggestions', suggestionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.post('/reviews/:id/delete', isLoggedIn, albumController.deleteReview);

console.log('Set up routes...');

// 3. Browser View Routes
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

//  Only ONE protected profile route exists .

app.get('/suggest', isLoggedIn, suggestionController.index);
app.get('/profile', isLoggedIn, getProfile);

app.get('/logout', (req, res) => {
    res.render('logout');
});

// Admin Routes
  app.get('/reviewadmin', isAdmin, (req, res) => {
    res.render('reviewadmin');
});
app.get('/admin/suggestions', isAdmin, suggestionController.adminIndex);
app.get('/admin/add', isAdmin, (req, res) => {
    res.render('admin/add', { error: null, success: null });
});

// Home Route
// Search Route
app.get('/search', (req, res) => {
    res.render('search');
});

console.log('Set up view routes...');

// Home Route - wrapped with error handling
app.get('/', async (req, res, next) => {
    try {
        await albumController.getAllAlbums(req, res);
    } catch (err) {
        console.error('Error in getAllAlbums:', err);
        next(err);
    }
});

console.log('Set up home route...');

// Global error handler for invalid IDs and unhandled errors
app.use((err, req, res, next) => {
    console.error('Error caught by global handler:', err);
    if (err.name === 'CastError' || err.statusCode === 404) {
        return res.status(404).render('404', { message: 'Page Not Found', type: 'content' });
    }
    res.status(500).send('Something went wrong: ' + err.message);
});

console.log('Set up error handler...');

// MongoDB Connection - Start server only after connection
console.log('Connecting to MongoDB...');
mongoose.connect(dbURL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

