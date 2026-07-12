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

const isProd = (process.env.NODE_ENV || 'development') === 'production';

// JWT secret: required in production, falls back to a dev-only value otherwise.
const jwtSecret = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
if (isProd && !process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('❌ JWT_SECRET must be set in production');
  process.exit(1);
} else if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  JWT_SECRET not set — using an insecure dev default.');
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  // How long a session may sit idle-occupied before it's treated as stale and
  // auto-released (prevents a never-logged-out manager blocking the system).
  sessionTtlMs: parseInt(process.env.SESSION_TTL_MS, 10) || 12 * 60 * 60 * 1000,
  isProd,
};

module.exports = env;
