const mongoose = require('mongoose');

// MongoDB Schema definition
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        if (!process.env.MONGODB_URI) {
            return res.status(500).json({ success: false, message: 'MONGODB_URI environment variable is missing in Vercel settings.' });
        }

        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const { name, email, mobile, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email address is already registered.' });
        }

        // Save new user
        const newUser = new User({ name, email, mobile, password });
        await newUser.save();

        return res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error("MongoDB Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};