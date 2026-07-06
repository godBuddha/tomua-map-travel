const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const corsConfig = require('./config/cors');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');

const app = express();

// Trust proxy for rate limiting behind nginx
app.set('trust proxy', 1);

// Redis client for rate limiting
let redisClient = null;
let rateLimitStore = null;

const initRedisForRateLimit = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error('Redis rate limit: too many retries');
          return Math.min(retries * 100, 2000);
        }
      }
    });
    
    redisClient.on('error', (err) => {
      logger.warn(`Redis rate-limit client error: ${err.message}`);
    });
    
    await redisClient.connect();
    logger.info('Redis connected for rate limiting');
    
    rateLimitStore = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
    
    return true;
  } catch (error) {
    logger.warn(`Redis rate-limit store unavailable, using memory store: ${error.message}`);
    return false;
  }
};

// Initialize Redis for rate limiting (non-blocking)
initRedisForRateLimit().catch(() => {});

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Tomua Map Travel API'
}));

// Security middleware (applied first)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*.tile.openstreetmap.org", "*.tile.opentopomap.org"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
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
const limiterConfig = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  validate: { trustProxy: true },
  // Use Redis store if available, otherwise memory store
  ...(rateLimitStore && { store: rateLimitStore })
};
const limiter = rateLimit(limiterConfig);
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  validate: { trustProxy: true },
  // Use Redis store if available
  ...(rateLimitStore && { store: rateLimitStore })
});
app.use('/api/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging with Winston + Morgan
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: logger.stream }));
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
