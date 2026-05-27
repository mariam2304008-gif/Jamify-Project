const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');


const mongoose = require('mongoose');

// Targeting Shard 00-00 directly as a standalone endpoint to bypass replica-set name matching loops
const dbURL = process.env.DATABASE_URL;
const albumController = require('./controllers/albumController');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(dbURL, {
    directConnection: true 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));


const albumRoutes = require('./routes/albums');
app.use('/albums', albumRoutes);

app.get('/', albumController.getAllAlbums);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});