require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
connectDB();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger — useful during dev

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
// Further routes (users, mentors, bookings) will be added in Phases 2 & 3

// Health check — quick sanity ping without hitting the DB
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jobfam backend running' });
});

// ── Error handler (must be LAST) ───────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
