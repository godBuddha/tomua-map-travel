const { createClient } = require('redis');
const logger = require('../utils/logger');

let client = null;

const CacheService = {
  // Initialize Redis connection
  async connect() {
    try {
      client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis: Too many reconnect attempts');
              return new Error('Too many reconnect attempts');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      client.on('error', (err) => {
        logger.error(`Redis error: ${err.message}`);
      });

      client.on('connect', () => {
        logger.info('Redis connected');
      });

      client.on('reconnecting', () => {
        logger.warn('Redis reconnecting...');
      });

      await client.connect();
      return true;
    } catch (error) {
      logger.error(`Redis connection failed: ${error.message}`);
      return false;
    }
  },

  // Get value from cache
  async get(key) {
    try {
      if (!client || !client.isOpen) return null;
      const value = await client.get(key);
      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache GET error: ${error.message}`);
      return null;
    }
  },

  // Set value in cache
  async set(key, value, ttlSeconds = 300) {
    try {
      if (!client || !client.isOpen) return false;
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
      logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
      return true;
    } catch (error) {
      logger.error(`Cache SET error: ${error.message}`);
      return false;
    }
  },

  // Delete value from cache
  async del(key) {
    try {
      if (!client || !client.isOpen) return false;
      await client.del(key);
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache DEL error: ${error.message}`);
      return false;
    }
  },

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      if (!client || !client.isOpen) return false;
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      logger.error(`Cache DEL pattern error: ${error.message}`);
      return false;
    }
  },

  // Clear all cache
  async flush() {
    try {
      if (!client || !client.isOpen) return false;
      await client.flushAll();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error(`Cache flush error: ${error.message}`);
      return false;
    }
  },

  // Get cache stats
  async stats() {
    try {
      if (!client || !client.isOpen) return null;
      const info = await client.info('memory');
      const keys = await client.dbSize();
      return {
        connected: client.isOpen,
        keys,
        memory: info
      };
    } catch (error) {
      logger.error(`Cache stats error: ${error.message}`);
      return null;
    }
  },

  // Middleware for caching API responses
  middleware(keyGenerator, ttlSeconds = 300) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = keyGenerator(req);
      
      try {
        const cached = await this.get(key);
        if (cached) {
          return res.json(cached);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache response
        res.json = async (data) => {
          // Cache successful responses
          if (data && data.success) {
            await this.set(key, data, ttlSeconds);
          }
          return originalJson(data);
        };

        next();
      } catch (error) {
        logger.error(`Cache middleware error: ${error.message}`);
        next();
      }
    };
  },

  // Disconnect from Redis
  async disconnect() {
    try {
      if (client) {
        await client.quit();
        logger.info('Redis disconnected');
      }
    } catch (error) {
      logger.error(`Redis disconnect error: ${error.message}`);
    }
  }
};

module.exports = CacheService;
