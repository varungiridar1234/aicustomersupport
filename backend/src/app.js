const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Static frontend build handling & Root GET '/' fallback
const distPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).json({
    status: 'ok',
    service: 'Shubya AI Customer Support Resolution Platform Backend API',
    version: '1.0.0',
    documentation: {
      healthCheck: 'GET /health',
      externalIngestion: 'POST /api/tickets/external',
      ticketsApi: 'GET /api/tickets',
    },
  });
});

// SPA routing fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).json({
    status: 'ok',
    service: 'Shubya AI Customer Support Resolution Platform Backend API',
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
