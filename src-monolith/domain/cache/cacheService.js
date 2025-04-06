const redisClientFactory = require('./redisClient.js');

// Constants
const DEFAULT_TTL = parseInt(process.env.REDIS_TTL, 10) || 3600; // 1 hour cache expiration
const CACHE_PREFIX = 'paste:';

/**
 * Service to handle caching operations
 */
class CacheService {
  /**
   * Get an item from cache
   * @param {string} key - The cache key
   * @returns {Promise<Object|null>} - The cached item or null
   */
  async get(key) {
    try {
      const client = await redisClientFactory.getClient();
      if (!client || !redisClientFactory.isClientConnected()) return null;
      
      const cachedItem = await client.get(`${CACHE_PREFIX}${key}`);
      return cachedItem ? JSON.parse(cachedItem) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set an item in cache
   * @param {string} key - The cache key
   * @param {Object} value - The value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = DEFAULT_TTL) {
    try {
      const client = await redisClientFactory.getClient();
      if (!client || !redisClientFactory.isClientConnected()) return false;
      
      await client.set(`${CACHE_PREFIX}${key}`, JSON.stringify(value), { EX: ttl });
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete an item from cache
   * @param {string} key - The cache key
   * @returns {Promise<boolean>} - Success status
   */
  async delete(key) {
    try {
      const client = await redisClientFactory.getClient();
      if (!client || !redisClientFactory.isClientConnected()) return false;
      
      await client.del(`${CACHE_PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }
}

// Create and export a singleton instance using factory pattern
const createCacheService = () => new CacheService();
module.exports = createCacheService();