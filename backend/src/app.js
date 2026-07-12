const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Trust the first proxy (needed for correct client IPs behind Nginx/Heroku).
app.set('trust proxy', 1);

// --- Security & hardening ---------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  })
);

// --- Body parsing -----------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Strip keys containing '$' or '.' to prevent NoSQL operator injection.
app.use(mongoSanitize());

// --- Performance & logging --------------------------------------------------
app.use(compression());
if (!env.isProd) app.use(morgan('dev'));

// Basic global rate limiter (tune per environment / per route later).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// --- Health check -----------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

// --- API routes -------------------------------------------------------------
app.use('/api/v1', apiRoutes);

// --- 404 + centralized error handling (must be last) ------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
