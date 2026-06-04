const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const dbURL = process.env.DATABASE_URL;
const albumController = require('./controllers/albumController');
const suggestionController = require('./controllers/suggestionController');
const { getProfile } = require('./controllers/userController');

const authRoutes = require('./routes/auth');
const isLoggedIn = require('./middleware/isLoggedIn');
const isAdmin = require('./middleware/isAdmin');
const songRoutes = require('./routes/songs');
const searchRoutes = require('./routes/search');

const app = express();
const port = 3000;

// Setup Template Engine & Parsers
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.sessionUser = req.session.user || null;
    next();
});

// MongoDB Connection
mongoose.connect(dbURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));




const albumRoutes = require('./routes/albums');
const suggestionRoutes = require('./routes/suggestions');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');


// 2. Route Routing Middlewares
app.use('/albums', albumRoutes);
app.use('/songs', songRoutes);
app.use('/admin', adminRoutes);
app.use('/api', authRoutes); // Handles POST /api/login and POST /api/signup
app.use('/api/artists', require('./routes/artists'));
app.use('/suggestions', suggestionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.post('/reviews/:id/delete', isLoggedIn, albumController.deleteReview);

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

// Home Route
app.get('/', albumController.getAllAlbums);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

