const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Album = require('./models/album');
const Song = require('./models/Song');

const DATABASE_URL = process.env.DATABASE_URL;

async function fixSongCovers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URL);
    console.log('Connected.\n');

    const albums = await Album.find({ coverImageUrl: { $exists: true, $ne: '' } }).lean();
    console.log(`Found ${albums.length} albums to process.\n`);

    let totalUpdated = 0;

    for (const album of albums) {
      const result = await Song.updateMany(
        { album: album._id },
        { $set: { coverImageUrl: album.coverImageUrl } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✔ "${album.title}" → updated ${result.modifiedCount} track(s) to: ${album.coverImageUrl}`);
        totalUpdated += result.modifiedCount;
      } else {
        console.log(`  ↷ "${album.title}" → no tracks needed updating`);
      }
    }

    console.log(`\n✅ Done. ${totalUpdated} song(s) updated in total.`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  }
}

fixSongCovers();