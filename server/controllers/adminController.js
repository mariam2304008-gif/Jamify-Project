// Example: A function to see all users (Admin only)
const User = require('../models/User');

exports.getAdminDashboard = async (req, res) => {
    try {
        const users = await User.find();
        res.render('reviewadmin', { users }); // This matches your 'reviewadmin.ejs' task
    } catch (err) {
        res.status(500).send("Admin Error");
    }
};