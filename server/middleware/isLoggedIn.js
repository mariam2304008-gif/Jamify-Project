module.exports = (req, res, next) => {
    // We check for 'user' because that's what we named it in the controller
    if (req.session && req.session.user) {
        return next(); // The user is logged in, let them through!
    }
    // If not logged in, you can send an error or redirect to login
    res.status(401).send("You must be logged in to view this page.");
};