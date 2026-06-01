const mongoose = require('mongoose');
const User = require('./models/User'); 
config = require('dotenv').config();

// Adjust path to your User model if needed

// Replace this string with your local connection or Atlas connection string
const DATABASE_URL = process.env.DATABASE_URL;

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(DATABASE_URL);
    console.log('Connected successfully.');

    // Step 1: Initialize fields that are missing entirely
    const initResult = await User.updateMany(
      {
        $or: [
          { followers: { $exists: false } },
          { followingUsers: { $exists: false } },
          { followingArtists: { $exists: false } }
        ]
      },
      {
        $set: {
          followers: [],
          followingUsers: [],
          followingArtists: []
        }
      }
    );

    // Step 2: Safety sweep—if fields exist but were saved as null, reset them to empty arrays
    const fixNullResult = await User.updateMany(
      {
        $or: [
          { followers: null },
          { followingUsers: null },
          { followingArtists: null }
        ]
      },
      {
        $set: {
          followers: [],
          followingUsers: [],
          followingArtists: []
        }
      }
    );

    const totalModified = initResult.modifiedCount + fixNullResult.modifiedCount;

    console.log(`\nMigration Complete!`);
    console.log(`- Created missing arrays for ${initResult.modifiedCount} users.`);
    console.log(`- Fixed null arrays for ${fixNullResult.modifiedCount} users.`);
    console.log(`- Total users updated: ${totalModified}\n`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  }
}

runMigration();