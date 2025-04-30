const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "192.168.101.5",
  port: process.env.REDIS_PORT || 6379,
  // Add password if your Redis instance requires authentication
  // password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Keep trying to reconnect
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisClient;