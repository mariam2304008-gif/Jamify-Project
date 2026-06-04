

// migrationScript.js
const mongoose = require('mongoose');
const album = require('./models/album'); // Adjust these paths to match your project structure
const Song = require('./models/Song');
config = require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

async function migrateLegacyData() {
    try {
          console.log('Connecting to database...');
          await mongoose.connect(DATABASE_URL);
          console.log('Connected successfully.');

        console.log("Starting database backfill migration...");

        const songGenreResult = await Song.updateMany(
            { 
                $or: [
                    { genre: { $exists: false } }, 
                    { genre: null }, 
                    { genre: '' }
                ] 
            },
            { $set: { genre: 'Pop' } }
        );
        console.log(`-> Genre backfill: Seeded ${songGenreResult.modifiedCount} tracks with 'Pop'.`);

        const songRatingResult = await Song.updateMany(
            { 
                $or: [
                    { rating: { $exists: false } }, 
                    { reviewCount: { $exists: false } }
                ] 
            },
            { 
                $style: {}, // Placeholder to cleanly structuralize $setOnInsert equivalents via standard $set
                $set: { 
                    rating: 0, 
                    reviewCount: 0 
                } 
            }
        );
        console.log(`-> Song metrics: Initialized ratings for ${songRatingResult.modifiedCount} tracks.`);



        const albumRatingResult = await album.updateMany(
            { 
                $or: [
                    { averageRating: { $exists: false } }, 
                    { reviewCount: { $exists: false } }
                ] 
            },
            { 
                $set: { 
                    averageRating: 0, 
                    reviewCount: 0 
                } 
            }
        );
        console.log(`-> Album metrics: Initialized ratings for ${albumRatingResult.modifiedCount} albums.`);
        
        console.log("\nSuccess! All legacy documents have been cleanly backfilled.");

    } catch (err) {
        console.error("Migration error backfilling collection records:", err.message);
    } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
}
}

// Execute the migration
migrateLegacyData();