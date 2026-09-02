const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Configure CORS for external customer portals & Render deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id', 'x-requested-with', 'accept', 'origin'],
}));

app.use(express.json());

// Public Health Check Endpoints (GET /health and GET /api/health)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Shubya AI Customer Support Platform' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Shubya AI Customer Support Platform' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api', auditRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
