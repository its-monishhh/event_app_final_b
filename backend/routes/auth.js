const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const dbOps = require('../db_sql');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev_secret_change';

router.post('/register', async (req, res) => {
    const { name, email, pass, role } = req.body;
    if (!email || !pass) return res.status(400).json({ error: 'email and password required' });

    try {
        const existing = await dbOps.getUserByEmail(email);
        if (existing) return res.status(400).json({ error: 'user exists' });

        const hash = await bcrypt.hash(pass, 10);
        const user = {
            id: nanoid(),
            name: name || '',
            email,
            pass: hash,
            role: role || 'user'
        };

        await dbOps.createUser(user);

        // Send welcome email (async, don't block response)
        sendWelcomeEmail(email, name);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, pass } = req.body;
    try {
        const u = await dbOps.getUserByEmail(email);
        if (!u) return res.status(400).json({ error: 'invalid credentials' });

        const ok = await bcrypt.compare(pass, u.pass);
        if (!ok) return res.status(400).json({ error: 'invalid credentials' });

        const token = jwt.sign(
            { id: u.id, email: u.email, name: u.name, role: u.role },
            SECRET,
            { expiresIn: '7d' }
        );
        res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await dbOps.getUserByEmail(email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = nanoid(32);
        const expires = Date.now() + 3600000; // 1 hour

        await dbOps.saveResetToken(token, email, expires);

        // Assuming frontend runs on same host/port logic or configured URL
        // In this setup, we'll assume standard vite dev port 5173 or process.env
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password/${token}`;

        await sendPasswordResetEmail(email, resetLink);

        res.json({ message: 'If that email exists, we sent a reset link.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPass } = req.body;
    if (!token || !newPass) return res.status(400).json({ error: 'Token and new password required' });

    try {
        const record = await dbOps.getResetToken(token);
        if (!record) return res.status(400).json({ error: 'Invalid or expired token' });

        if (Date.now() > record.expires) {
            await dbOps.deleteResetToken(token);
            return res.status(400).json({ error: 'Token expired' });
        }

        const hash = await bcrypt.hash(newPass, 10);
        await dbOps.updateUserPassword(record.email, hash);
        await dbOps.deleteResetToken(token);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const auth = (req, res, next) => {
    const h = req.headers.authorization;
    if (!h) return res.status(401).json({ error: 'no token' });
    const token = h.replace('Bearer ', '');
    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'invalid token' });
    }
};

router.get('/me', auth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = { router, auth, SECRET };
