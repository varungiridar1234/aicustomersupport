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

// Configure CORS for external customer portal & Render deployment
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors({
  origin: allowedOrigin ? allowedOrigin.split(',').map(o => o.trim()) : '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id'],
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
