const { getRedisClient } = require('./redisClient');

class CacheService {
  constructor(namespace) {
    this.namespace = namespace || '';
    this.defaultTTL = parseInt(process.env.REDIS_TTL, 10) || 3600; // default 1 hour
  }

  // Create a namespaced key to avoid collisions between services
  _namespaceKey(key) {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  async get(key) {
    try {
      const client = await getRedisClient();
      const value = await client.get(this._namespaceKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      // Return null on error to gracefully degrade (cache should be non-blocking)
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const client = await getRedisClient();
      const options = ttl ? { EX: parseInt(ttl, 10) } : {};
      await client.set(this._namespaceKey(key), JSON.stringify(value), options);
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      const client = await getRedisClient();
      await client.del(this._namespaceKey(key));
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      const client = await getRedisClient();
      return await client.exists(this._namespaceKey(key)) === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  // For specific slug generator needs - check if a slug already exists
  async isSlugAvailable(slug) {
    return !(await this.exists(slug));
  }
}

// Factory function to create a namespace-specific cache service
function createCacheService(namespace) {
  return new CacheService(namespace);
}

module.exports = { createCacheService };