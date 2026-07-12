const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');

let server;

async function start() {
  await connectDB();
  server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 AssetFlow API running in ${env.nodeEnv} mode on port ${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`   http://localhost:${env.port}/api/v1`);
  });
}

// Graceful shutdown so in-flight requests drain and Mongo closes cleanly.
async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  process.exit(0);
}

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

// Fail fast on truly unexpected errors.
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
