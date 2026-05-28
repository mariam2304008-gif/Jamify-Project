const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Handle User Signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).send("User already exists"); // Simple error for now

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, email, password: hashedPassword });
        await user.save();

        // AFTER SIGNUP: Redirect them to the login page
        res.redirect('/login'); 
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Handle User Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body; // Grab username from the form

        // Search the database for the username
        const user = await User.findOne({ username: username }); 
        
        if (!user) {
            return res.status(400).send("Invalid Credentials (User not found)");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials (Wrong password)");
        }

        // Success! Set up the session
        req.session.user = {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin || false
        };

        res.redirect('/'); 
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Make sure "exports.logout" matches exactly what you call in auth.js
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.redirect('/login');
    });
};