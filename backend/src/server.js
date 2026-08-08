// Phase 0 placeholder server — will be expanded in Phase 1 with full middleware + routes
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check — confirms the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jobfam backend running — Phase 0 scaffold' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
