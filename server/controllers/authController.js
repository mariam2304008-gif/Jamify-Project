const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};