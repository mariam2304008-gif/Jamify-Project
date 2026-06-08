const User = require('../models/User');
const bcrypt = require('bcryptjs');


exports.signup = async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) return res.status(400).json({ error: 'user_exists', message: 'An account with that username or email already exists.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        user = new User({ 
            username, 
            email, 
            password: hashedPassword,
            displayName: displayName || username,
            bio: "No bio yet.",
            profileImageUrl: "/Images/album-profile-images/epic.png", 
            isAdmin: false
        });
        
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'server_error', message: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        
        const loginInput = req.body.username || req.body.email; 
        const password = req.body.password;

        if (!loginInput || !password) {
           return res.status(400).json({ error: 'missing_fields', message: 'Please provide both a username/email and password.' });
        }

        
        const user = await User.findOne({
            $or: [
                { username: loginInput },
                { email: loginInput }
            ]
        });
        
        if (!user) {
           return res.status(404).json({ error: 'user_not_found', message: 'User does not exist.' });
        }

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
           return res.status(401).json({ error: 'wrong_password', message: 'Wrong password.' });
        }

       
        req.session.user = {
        id: user._id.toString(),   
        _id: user._id.toString(),  
        username: user.username,
        isAdmin: user.isAdmin || false
        };

        
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
               return res.status(500).json({ error: 'session_error', message: 'Error saving login session.' });
            }
           res.status(200).json({ success: true });
        });

    } catch (err) {
       res.status(500).json({ error: 'server_error', message: err.message });
    }
};


exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login');
    });
};
