module.exports = (req, res, next) => {
    
    
    if (req.session && req.session.user && req.session.user.isAdmin === true) {
        return next(); 
    }

    
    res.status(403).send("Access Denied: You do not have Admin privileges.");
};