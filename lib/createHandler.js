const express = require('express');
const cookieParser = require('cookie-parser');
const { connectToDatabase } = require('./mongoServer');
const { handleTokenExpiredError } = require('./middleware');

/**
 * Creates a mini Express app for a Vercel serverless function.
 * Handles DB connection, body/cookie parsing, and error handling automatically.
 * @param {(app: import('express').Express) => void} setupRoutes
 */
const createHandler = (setupRoutes) => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.use(async (req, res, next) => {
    try {
      await connectToDatabase();
      next();
    } catch (err) {
      console.error('[DB] Connection failed:', err.message);
      return res.status(503).json({ message: 'Database unavailable' });
    }
  });

  setupRoutes(app);
  app.use(handleTokenExpiredError);

  return app;
};

module.exports = createHandler;
