const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Manager = require('../models/manager.model');
const SystemState = require('../models/systemState.model');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/** Sign a JWT that binds a manager to a specific login session. */
function signToken(managerId, sessionId) {
  return jwt.sign({ sub: String(managerId), sid: sessionId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Is the system actively occupied right now? A session older than the TTL is
 * treated as stale (e.g. a manager who never logged out) and auto-released.
 */
function isActivelyOccupied(state) {
  if (!state.isOccupied || !state.currentManager || !state.loginTime) return false;
  const age = Date.now() - new Date(state.loginTime).getTime();
  return age < env.sessionTtlMs;
}

/**
 * Authenticate a manager and open the single application session.
 * Rejects if a DIFFERENT manager currently holds an active session.
 */
async function login({ email, password }) {
  const manager = await Manager.findOne({ email }).select('+password');
  if (!manager || !(await manager.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!manager.isActive) {
    throw new ApiError(403, 'This manager account is inactive');
  }

  const state = await SystemState.getSingleton();
  if (isActivelyOccupied(state) && String(state.currentManager) !== String(manager._id)) {
    throw new ApiError(409, 'Another manager is currently using the system.');
  }

  // Occupy (or take over a stale/own) session with a fresh session id.
  const sessionId = crypto.randomUUID();
  state.currentManager = manager._id;
  state.sessionId = sessionId;
  state.loginTime = new Date();
  state.isOccupied = true;
  await state.save();

  manager.lastLogin = new Date();
  await manager.save();

  const token = signToken(manager._id, sessionId);
  // Re-fetch as a plain object without the password for the response.
  const safeManager = await Manager.findById(manager._id);
  return { token, manager: safeManager };
}

/**
 * Validate a bearer token against the live session. Returns the manager.
 * Throws 401 if the token is invalid OR the session has ended/been superseded.
 */
async function verifySession(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session token');
  }

  const manager = await Manager.findById(payload.sub);
  if (!manager || !manager.isActive) {
    throw new ApiError(401, 'Manager account no longer active');
  }

  const state = await SystemState.getSingleton();
  const valid =
    state.isOccupied &&
    String(state.currentManager) === String(manager._id) &&
    state.sessionId === payload.sid;
  if (!valid) {
    throw new ApiError(401, 'Session ended. Please log in again.');
  }

  return manager;
}

/** End the session for this manager, freeing the system for others. */
async function logout(manager) {
  const state = await SystemState.getSingleton();
  if (state.currentManager && String(state.currentManager) === String(manager._id)) {
    state.currentManager = null;
    state.sessionId = null;
    state.loginTime = null;
    state.isOccupied = false;
    await state.save();
  }
  return { success: true };
}

module.exports = { login, verifySession, logout };
