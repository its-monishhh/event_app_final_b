const express = require('express');
const { nanoid } = require('nanoid');
const dbOps = require('../db_sql');
const { auth } = require('./auth');
const { sendEventRegistrationEmail } = require('../services/emailService');

const mult = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = mult.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = mult({ storage });

router.get('/', async (req, res) => {
    try {
        const events = await dbOps.getEvents();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const e = await dbOps.getEventById(req.params.id);
        if (!e) return res.status(404).json({ error: 'not found' });
        res.json(e);
    } catch (err) {
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
    if (req.user.role !== 'organiser' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only organisers can create events' });
    }

    // If using FormData, data is in req.body.
    // image file is in req.file
    const { title, desc, loc, date, cap } = req.body;

    // Build image URL
    // We'll serve uploads from /uploads
    let imageUrl = '';
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
        // Fallback for direct URL string if supported
        imageUrl = req.body.image;
    }

    const ev = {
        id: nanoid(),
        title: title || 'Untitled',
        desc: desc || '',
        loc: loc || '',
        date: date || new Date().toISOString(),
        cap: cap ? parseInt(cap) : 100,
        image: imageUrl || '',
        createdBy: req.user.id,
        registered: 0
    };

    try {
        await dbOps.createEvent(ev);
        res.json(ev);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

router.post('/:id/register', auth, async (req, res) => {
    try {
        const ev = await dbOps.getEventById(req.params.id);
        if (!ev) return res.status(404).json({ error: 'event not found' });

        const already = await dbOps.getRegistration(ev.id, req.user.id);
        if (already) return res.status(400).json({ error: 'already registered' });

        if (ev.registered >= ev.cap) return res.status(400).json({ error: 'event full' });

        const { phone, details, usn, branch, semester } = req.body;
        const reg = {
            id: nanoid(),
            eid: ev.id,
            uid: req.user.id,
            at: new Date().toISOString(),
            phone: phone || '',
            details: details || '',
            usn: usn || '',
            branch: branch || '',
            semester: semester || ''
        };
        await dbOps.createRegistration(reg);

        // Send confirmation email
        sendEventRegistrationEmail(req.user.email, req.user.name, ev.title, ev.date, ev.loc);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const ev = await dbOps.getEventById(req.params.id);
        if (!ev) return res.status(404).json({ error: 'not found' });

        if (ev.createdBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'forbidden' });
        }

        await dbOps.deleteEvent(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
