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

// Cached connection handling for Serverless
let cachedPromise = null;

async function connectToDatabase(uri) {
    if (cachedPromise) {
        return cachedPromise;
    }

    cachedPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        bufferCommands: false,
    }).then((mongooseInstance) => {
        return mongooseInstance;
    });

    return cachedPromise;
}

module.exports = async function handler(req, res) {
    // CORS Headers (ફ્રન્ટએન્ડ સાથે કનેક્શન બ્લોક ન થાય તે માટે)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoUri) {
            return res.status(500).json({ 
                success: false, 
                message: 'Mongo Connection String is missing in Vercel settings.' 
            });
        }

        // Connect using cached promise
        await connectToDatabase(mongoUri);

        // Body parsing safety check
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { name, email, mobile, password } = body || {};

        if (!name || !email || !mobile || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

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