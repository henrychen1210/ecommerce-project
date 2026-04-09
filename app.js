const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const UserRouter = require('./routes/users.js');

const app = express();
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :response-time ms'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));

// API routes (mirrors Vercel's /api/* functions for local dev)
app.use('/api', UserRouter);

// Serve product details static page for any /products/details/:id path
app.get('/products/details/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products', 'details', 'index.html'));
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.all('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404', 'index.html'));
});

module.exports = app;
