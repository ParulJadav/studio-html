const express = require('express');
const cors = require('cors');
const path = require('path');
const Brevo = require('@getbrevo/brevo');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// મેઈન ફોલ્ડરની જ સ્ટેટિક ફાઈલો (HTML, CSS, JS) સર્વ કરવા માટે
app.use(express.static(__dirname));

// MongoDB Client Connection
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// ------------------- ROUTES -------------------

// Home Route (login.html બતાવવા માટે)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 1. Brevo Email OTP Endpoint
app.post('/api/send-email-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    try {
        let apiInstance = new Brevo.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "STUDIO HTML - Verification Code";
        sendSmtpEmail.htmlContent = `<div style="font-family: Arial; padding: 20px;">
                                        <h2>Verification Code</h2>
                                        <p>Your OTP Code is: <b style="font-size: 24px; color: #007bff;">${otp}</b></p>
                                     </div>`;
        sendSmtpEmail.sender = { "name": "STUDIO HTML", "email": process.env.VERIFIED_EMAIL };
        sendSmtpEmail.to = [{ "email": email }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        res.json({ success: true, message: 'OTP Email sent successfully' });
    } catch (error) {
        console.error("Brevo Error:", error);
        res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
});

// 2. Register User to MongoDB Endpoint
app.post('/api/register-user', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("studio_html");
        const usersCollection = db.collection("users");

        const userData = req.body;
        const result = await usersCollection.insertOne({
            ...userData,
            created_at: new Date()
        });

        res.json({ success: true, message: 'User registered successfully', id: result.insertedId });
    } catch (error) {
        console.error("MongoDB Error:", error);
        res.status(500).json({ success: false, message: 'Database saving failed' });
    }
});

// ------------------- SERVER LISTEN -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;