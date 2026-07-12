const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend root regardless of the process CWD.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralized, validated environment configuration.
 * Fail fast at boot if a required variable is missing.
 */
const required = ['MONGODB_URI'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  isProd: (process.env.NODE_ENV || 'development') === 'production',
};

module.exports = env;
