const User = require('../models/User');

exports.search = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        }).select('username profilePicture');

        res.json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};