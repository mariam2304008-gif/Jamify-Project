// this file is for songs and albums so that they dont have the same block of code in their routes,
// and have it just unified to this one!

module.exports = (req, res, next) => {
    if (req.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Please log in first.' });
};