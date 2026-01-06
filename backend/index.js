require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { router: authRoutes } = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve uploaded images

// Serve Frontend in production (or if built)
const FRONTEND_PATH = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_PATH));

app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server listening on', PORT));
