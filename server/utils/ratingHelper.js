
const album = require('../models/album');
const review = require('../models/review');
const Song = require('../models/Song');

async function updateAverageRating(id, modelType) {
    const Model = modelType === 'Album' ? album : Song;
    const matchField = modelType === 'Album' ? 'albumID' : 'songID';

    
    const reviews = await review.find({ [matchField]: id });

    if (reviews.length === 0) {
        
        await Model.findByIdAndUpdate(id, { rating: 0, reviewCount: 0 });
        return;
    }

    
    const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    
    
    const average = Math.round((sum / reviews.length) * 10) / 10;

    
    await Model.findByIdAndUpdate(id, { 
        rating: average, 
        reviewCount: reviews.length 
    });
}

module.exports = { updateAverageRating };