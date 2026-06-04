// utils/ratingHelper.js
const album = require('../models/album');
const review = require('../models/review');
const Song = require('../models/Song');

async function updateAverageRating(id, modelType) {
    const Model = modelType === 'Album' ? album : Song;
    const matchField = modelType === 'Album' ? 'albumID' : 'songID';

    // 1. Fetch all reviews matching this specific parent asset id
    const reviews = await review.find({ [matchField]: id });

    if (reviews.length === 0) {
        // Clear metrics cleanly if the last review is deleted
        await Model.findByIdAndUpdate(id, { rating: 0, reviewCount: 0 });
        return;
    }

    // 2. Sum up all individual ratings
    const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    
    // 3. Compute mean average and restrict rounding precision to 1 decimal point
    const average = Math.round((sum / reviews.length) * 10) / 10;

    // 4. Update the target parent document data
    await Model.findByIdAndUpdate(id, { 
        rating: average, 
        reviewCount: reviews.length 
    });
}

module.exports = { updateAverageRating };