const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

// Targeting Shard 00-00 directly as a standalone endpoint to bypass replica-set name matching loops
const dbURL = process.env.DATABASE_URL;
const albumController = require('./controllers/albumController');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'jamify-secret-key', // This can be any string
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true only if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Cookie lasts 24 hours
    }
}));

// Remove directConnection: true
mongoose.connect(dbURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));


const albumRoutes = require('./routes/albums');
app.use('/albums', albumRoutes);
app.use('/api', authRoutes); 

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null }); // <--- ADDED
});

app.get('/', albumController.getAllAlbums);

//const isAdmin = require('./middleware/isAdmin'); // Import your part


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});