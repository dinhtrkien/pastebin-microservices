const redisClient = require("./redisClient.js");
const CACHE_KEY_PREFIX = "token_range:";

/**
 * Persists the current token range state to Redis.
 * @param {string} instanceId - The unique ID of the Token Service instance.
 * @param {object} rangeState - The state object { range_start, range_end, next_value }.
 * @param {number} ttlSeconds - Time-to-live in seconds for the cache entry.
 */
async function persistRangeState(
  instanceId,
  rangeState,
  ttlSeconds = 3600
) {
  // Default TTL 1 hour
  const key = `${CACHE_KEY_PREFIX}${instanceId}`;
  try {
    await redisClient.set(key, JSON.stringify(rangeState), "EX", ttlSeconds);
    console.log(`Persisted range state for ${instanceId} to Redis.`);
  } catch (error) {
    console.error(
      `Error persisting range state for ${instanceId} to Redis:`,
      error
    );
    // Depending on requirements, might want to handle this error more gracefully
  }
}

/**
 * Retrieves the token range state from Redis.
 * @param {string} instanceId - The unique ID of the Token Service instance.
 * @returns {Promise<object|null>} The state object or null if not found/error.
 */
async function retrieveRangeState(instanceId) {
  const key = `${CACHE_KEY_PREFIX}${instanceId}`;
  try {
    const stateString = await redisClient.get(key);
    if (stateString) {
      console.log(`Retrieved range state for ${instanceId} from Redis.`);
      return JSON.parse(stateString);
    }
    console.log(`No range state found in Redis for ${instanceId}.`);
    return null;
  } catch (error) {
    console.error(
      `Error retrieving range state for ${instanceId} from Redis:`,
      error
    );
    return null;
  }
}

module.exports = {
  persistRangeState,
  retrieveRangeState,
};