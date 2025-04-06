const redis = require('redis');
require('dotenv').config();

// Create Redis client with connection retry logic
async function createRedisClient() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retry_strategy: function(options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error
        console.error('Redis connection refused');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after 1 hour
        console.error('Retry time exhausted');
        return new Error('Retry time exhausted');
      }
      // Reconnect after 3 seconds
      return Math.min(options.attempt * 1000, 3000);
    }
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    console.log('Connected to Redis');
  });

  client.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
  });

  await client.connect();
  return client;
}

// Singleton pattern for Redis client
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    try {
      redisClient = await createRedisClient();
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      throw error;
    }
  }
  return redisClient;
}

module.exports = { getRedisClient };