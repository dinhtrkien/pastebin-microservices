// Future implementation in paste-service/src/redis/redisClient.js
const redis = require('redis');
require('dotenv').config();

async function createRedisClient() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await client.connect();
  return client;
}

// Singleton pattern
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
}

module.exports = { getRedisClient };