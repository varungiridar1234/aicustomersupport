const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const os = require('os');

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

  // 2. Fallback to MongoMemoryServer using isolated temp directory
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongo-db-'));
    const { MongoMemoryServer } = require('mongodb-memory-server');

    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: tmpDir,
      },
    });

    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] MongoMemoryServer connected at ${uri}`);
    return;
  } catch (error) {
    console.warn(`[Database] Custom dbPath launch warning: ${error.message}. Retrying standard launch...`);
  }

  // 3. Fallback to standard launch
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] MongoMemoryServer connected at ${uri}`);
  } catch (finalErr) {
    console.error(`[Database] Error connecting to MongoMemoryServer: ${finalErr.message}`);
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
