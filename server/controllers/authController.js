const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Handle User Signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists by email or username
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) return res.status(400).send("User already exists with that email or username");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Dynamically initialize clean fields in Atlas upon signup
        user = new User({ 
            username, 
            email, 
            password: hashedPassword,
            displayName: username, 
            bio: "No bio yet.",
            profileImageUrl: "/Images/album-profile-images/epic.png", 
            isAdmin: false
        });
        
        await user.save();
        res.redirect('/login'); 
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Handle User Login
exports.login = async (req, res) => {
    try {
        // FIXED: Explicitly grab both the input identifier AND the password from the form body!
        const loginInput = req.body.username || req.body.email; 
        const password = req.body.password;

        if (!loginInput || !password) {
            return res.status(400).send("Please provide both a username/email and password to log in.");
        }

        // Search for the account matching either field in Atlas
        const user = await User.findOne({
            $or: [
                { username: loginInput },
                { email: loginInput }
            ]
        });
        
        if (!user) {
            return res.status(400).send("Invalid Credentials (User not found)");
        }

        // Check password dynamically
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials (Wrong password)");
        }

       
        req.session.user = {
        id: user._id.toString(),   // Keeps your code working
        _id: user._id.toString(),  // FIX: This gives your friend's userController the exact key it wants!
        username: user.username,
        isAdmin: user.isAdmin || false
        };

        // Explicitly save the session before redirecting to guarantee the cookie updates immediately
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).send("Error saving login session.");
            }
            res.redirect('/'); 
        });

    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Handle User Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login');
    });
};