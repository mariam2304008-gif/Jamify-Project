const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Album = require('./models/album'); // Adjust paths if your folder structure is different
const Song = require('./models/Song');

const dbURL = process.env.DATABASE_URL;

async function runDatabaseMigration() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(dbURL);
        console.log('Connected successfully.\n');

        // ==========================================
        // TASK 1: Handle Standalone Singles (No Album)
        // ==========================================
        console.log('--- Processing Standalone Singles ---');
        const standaloneResult = await Song.updateMany(
            { 
                album: null,
                $or: [
                    { coverImageUrl: '' },
                    { coverImageUrl: null }
                ]
            },
            { $set: { coverImageUrl: '/Images/album-profile-images/epic.png' } }
        );
        console.log(`Updated ${standaloneResult.modifiedCount} standalone songs with the default static photo.\n`);

        // ==========================================
        // TASK 2: Handle Album Tracks / Single Tracks (Inherit Cover Art)
        // ==========================================
        console.log('--- Processing Album/Single Tracks ---');
        // Find tracks belonging to an album that either have no image or are using the fallback asset placeholder
        const tracksToUpdate = await Song.find({
            album: { $ne: null },
            $or: [
                { coverImageUrl: '' },
                { coverImageUrl: null },
                { coverImageUrl: '/Images/album-profile-images/epic.png' }
            ]
        });

        console.log(`Found ${tracksToUpdate.length} album tracks requiring artwork inheritance.`);

        let dynamicUpdatesCount = 0;

        for (const song of tracksToUpdate) {
            // Find the parent album document linked via the object ID reference mapping field
            const parentAlbum = await Album.findById(song.album);
            
            if (parentAlbum && parentAlbum.coverImageUrl) {
                await Song.updateOne(
                    { _id: song._id },
                    { $set: { coverImageUrl: parentAlbum.coverImageUrl } }
                );
                console.log(` -> "${song.title}" inherited cover art from "${parentAlbum.title}"`);
                dynamicUpdatesCount++;
            } else {
                console.log(` -> Skipped "${song.title}": Parent album artwork not found.`);
            }
        }

        console.log(`\nSuccessfully matched and updated ${dynamicUpdatesCount} album tracks.`);
        console.log('\n--- All Database Migrations Complete! ---');

    } catch (err) {
        console.error('An error occurred during migration processing:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected safely from MongoDB.');
    }
}

runDatabaseMigration();