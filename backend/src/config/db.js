const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB. Retries are handled by the Mongoose driver's
 * built-in buffering; a hard failure here should crash the process
 * so an orchestrator (PM2/Docker/K8s) can restart it.
 */
async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('⚠️  MongoDB disconnected');
  });

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

/** Gracefully close the connection (used on shutdown). */
async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
