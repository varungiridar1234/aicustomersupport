require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const Ticket = require('./models/Ticket');
const { seedData } = require('../scripts/seed');
const NotificationService = require('./services/notificationService');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

NotificationService.init(io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`[Socket.IO] User ${userId} joined room user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  
  try {
    const count = await Ticket.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Auto-seeding demo dataset...');
      await seedData(true);
    }
  } catch (err) {
    console.error('[Server] Auto-seed error:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` ResolvAI Backend Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { server, app };
