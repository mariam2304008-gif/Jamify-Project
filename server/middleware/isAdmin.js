module.exports = (req, res, next) => {
    // 1. Check if they are even logged in
    // 2. Check if the 'isAdmin' property is true
    if (req.session && req.session.user && req.session.user.isAdmin === true) {
        return next(); // They are an admin! Let them in.
    }

    // If they aren't an admin, block them
    res.status(403).send("Access Denied: You do not have Admin privileges.");
};