require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { initMailer } = require('./config/mailer');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and initialise the Ethereal test mailer before starting
connectDB();
initMailer();

// ── Middleware ─────────────────────────────────────────────────────────────────
// CLIENT_URL: the frontend origin allowed to make cross-origin requests.
// Local dev default: http://localhost:5173
// Production: set CLIENT_URL to the deployed Vercel URL in Render's environment variables.
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173', // always allow local dev
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) or from an allowed origin
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger — useful during dev

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check — quick sanity ping without hitting the DB
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jobfam backend running' });
});

// ── Error handler (must be LAST) ───────────────────────────────────────────────
app.use(errorHandler);

// Bind to 0.0.0.0 so Render (and other cloud hosts) can reach the server.
// Local development is unaffected — http://localhost:<PORT> still works.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (bound to 0.0.0.0)`);
});
