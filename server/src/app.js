const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const corsConfig = require('./config/cors');
const routes = require('./routes');

const app = express();

// Security middleware (applied first)
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors(corsConfig));

// Health check — placed BEFORE rate limiter so monitoring/load-balancers are never throttled
// BUG-08 FIX: Previously defined after app.use('/api/', limiter) — was being rate-limited
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Rate limiting (applied after health check)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute (development)
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  validate: { trustProxy: false }
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  validate: { trustProxy: false }
});
app.use('/api/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api', routes);

// No-cache headers for HTML files
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Serve static files from root directory (where HTML files are)
app.use(express.static(path.join(__dirname, '../..'), {
  extensions: ['html'],
  index: 'login.html'
}));

// Serve uploaded files from server/uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// SPA fallback - serve login.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Don't serve login.html for static file requests
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  // Serve the requested file or fallback to login.html
  const filePath = path.join(__dirname, '../..', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, '../../login.html'));
    }
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;
