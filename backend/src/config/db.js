const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_support';
  
  // 1. Attempt standard MongoDB connection
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[Database] Standard MongoDB Connected: ${mongoose.connection.host}`);
    return;
  } catch (err) {
    console.log(`[Database] Local/Atlas MongoDB not detected (${err.message}). Starting In-Memory MongoDB...`);
  }

  // 2. Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] MongoMemoryServer connected at ${uri}`);
    return;
  } catch (error) {
    console.error(`[Database] MongoMemoryServer error: ${error.message}`);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (e) {}
};

module.exports = { connectDB, disconnectDB };
