const { createClient } = require('redis');

// Constants
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Redis client factory
 */
class RedisClientFactory {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Get Redis client instance (connects if not already connected)
   * @returns {Promise<Object>} Redis client
   */
  async getClient() {
    if (!this.client) {
      try {
        // Create Redis client with connection string from environment variables
        this.client = createClient({
          url: REDIS_URL
        });

        // Set up event handlers
        this.client.on('error', (err) => console.error('Redis Client Error:', err));
        this.client.on('connect', () => {
          console.log('Connected to Redis');
          this.isConnected = true;
        });
        this.client.on('disconnect', () => {
          console.log('Disconnected from Redis');
          this.isConnected = false;
        });
        
        // Connect to Redis
        await this.client.connect();
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        this.isConnected = false;
        this.client = null;
      }
    }
    
    return this.client;
  }

  /**
   * Check if Redis client is connected
   * @returns {boolean} Connection status
   */
  isClientConnected() {
    return this.isConnected;
  }
}

// Create and export a singleton instance using factory pattern
const createRedisClientFactory = () => new RedisClientFactory();
module.exports = createRedisClientFactory();