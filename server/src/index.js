require('dotenv').config();
const app = require('./app');
const db = require('./config/database');
const logger = require('./utils/logger');
const CacheService = require('./services/cache.service');

const PORT = process.env.PORT || 5000;

// Test database connection and start server
Promise.all([
  db.raw('SELECT 1'),
  CacheService.connect()
])
  .then(([dbResult, cacheConnected]) => {
    logger.info('Database connected successfully');
    if (cacheConnected) {
      logger.info('Redis cache connected');
    } else {
      logger.warn('Redis cache not available - running without cache');
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API: http://localhost:${PORT}/api`);
      logger.info(`Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  });

// Handle unhandled promise rejections - DO NOT EXIT, just log
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason?.message || reason}`);
  // Do not exit - let the server continue running
});

// Handle uncaught exceptions - log but try to continue
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Do not exit immediately - let existing connections finish
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await CacheService.disconnect();
  process.exit(0);
});
