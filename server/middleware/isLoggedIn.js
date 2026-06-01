const User = require('../models/User');

module.exports = async (req, res, next) => {
    // 1. Check if the session and user token exist
    if (req.session && req.session.user) {
        try {
            // 2. Fetch the fresh database document using the session ID
            const dbUser = await User.findById(req.session.user.id);
            
            if (dbUser) {
                // 3. Attach it to res.locals so EVERY EJS file can see 'user' automatically!
                res.locals.user = dbUser;
                req.user = dbUser; // Backwards compatibility helper
                return next();
            }
        } catch (err) {
            console.error("Middleware session fetch error:", err);
        }
    }
    
    // If session is invalid or user wasn't found in DB, clear session and send to login
    res.redirect('/login');
};