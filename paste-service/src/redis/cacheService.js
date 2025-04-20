const { getRedisClient } = require('./redisClient');

class CacheService {
  constructor(prefix = 'paste:') {
    this.prefix = prefix;
    this.defaultTTL = parseInt(process.env.REDIS_TTL, 10) || 3600; // 1 hour
  }

  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  async get(key) {
    try {
      const client = await getRedisClient();
      const value = await client.get(this._getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null; // Graceful degradation
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const client = await getRedisClient();
      await client.set(this._getKey(key), JSON.stringify(value), { EX: ttl });
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      const client = await getRedisClient();
      await client.del(this._getKey(key));
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }
}

module.exports = new CacheService();