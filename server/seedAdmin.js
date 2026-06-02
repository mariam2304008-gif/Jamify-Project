const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB.');

        const existing = await User.findOne({ username: 'admin' });
        if (existing) {
            console.log('Admin account already exists. Nothing changed.');
            return;
        }

        const hashedPassword = await bcrypt.hash('Admin123', 10);

        await User.create({
            username: 'admin',
            email: 'admin@jamify.com',
            password: hashedPassword,
            displayName: 'Admin',
            isAdmin: true
        });

        console.log('Admin account created successfully.');
        console.log('Username: admin');
        console.log('Password: Admin123');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
