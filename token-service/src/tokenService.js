const os = require('os');
const axios = require('axios');
const dotenv = require('dotenv');

const { encodeBase62Fixed } = require('./utils/base62.js');
const { persistRangeState, retrieveRangeState } = require('./redis/cacheService.js');

dotenv.config();

const TRS_URL = process.env.TRS_URL || 'http://localhost:3003'; // URL of the Token Range Service
const PREFETCH_THRESHOLD_PERCENT = 0.9; // 90%

class TokenService {
  constructor() {
    this.instanceId = `${os.hostname()}`;
    this.range_start = null;
    this.range_end = null;
    this.next_value = null;
    this.isLeasing = false; // Flag to prevent concurrent lease requests
    this.isInitialized = false;
    this.pendingLeasePromise = null; // Stores the promise of an ongoing lease request

    console.log(`Token Service Instance ID: ${this.instanceId}`);
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('Initializing Token Service...');
    // Try to retrieve state from Redis first
    const cachedState = await retrieveRangeState(this.instanceId);
    if (cachedState && cachedState.range_start !== undefined && cachedState.range_end !== undefined && cachedState.next_value !== undefined) {
        console.log('Restoring state from Redis cache.');
        this.range_start = BigInt(cachedState.range_start);
        this.range_end = BigInt(cachedState.range_end);
        this.next_value = BigInt(cachedState.next_value);
        // Optional: Check if the cached range is still valid or close to expiry based on TRS logic
        // For simplicity, we assume it's usable if found.
        this.isInitialized = true;
        console.log(`Initialization complete. Current range: [${this.range_start}, ${this.range_end}], Next: ${this.next_value}`);
        return;
    }

    console.log('No valid cache found. Requesting initial lease from TRS...');
    try {
        await this.leaseNewRange();
        this.isInitialized = true;
        console.log('Initialization complete after fetching initial lease.');
    } catch (error) {
        console.error('FATAL: Failed to get initial lease during initialization.', error);
        // In a real scenario, might retry or exit
        throw new Error('Token Service initialization failed.');
    }
  }

  async leaseNewRange() {
    if (this.isLeasing) {
        console.log('Lease request already in progress. Waiting for completion...');
        return this.pendingLeasePromise; // Return the existing promise
    }

    this.isLeasing = true;
    this.pendingLeasePromise = (async () => {
        console.log(`Requesting new token range from TRS (${TRS_URL}/leaseRange)...`);
        try {
            const response = await axios.post(`${TRS_URL}/leaseRange`, {
                instanceId: this.instanceId,
                // batchSize: 10000 // Optional: specify if different from TRS default
            });

            const { range_start, range_end, next_value } = response.data;
            console.log('Received new range:', response.data);

            // IMPORTANT: Use BigInt for large numbers
            this.range_start = BigInt(range_start);
            this.range_end = BigInt(range_end);
            // Start generating from the beginning of the new range
            this.next_value = BigInt(next_value);

            // Persist to Redis (fire and forget, or await if critical)
            persistRangeState(this.instanceId, {
                range_start: this.range_start.toString(),
                range_end: this.range_end.toString(),
                next_value: this.next_value.toString(),
            });

            console.log(`Successfully leased new range: [${this.range_start}, ${this.range_end}]. Next value: ${this.next_value}`);
            return true; // Indicate success
        } catch (error) {
            console.error('Error leasing new range from TRS:', error.response ? error.response.data : error.message);
            // Implement retry logic or error handling as needed
            throw error; // Re-throw to signal failure
        } finally {
            this.isLeasing = false;
            this.pendingLeasePromise = null; // Clear the stored promise
        }
    })();

    return this.pendingLeasePromise;
  }

  async getSlug() {
    if (!this.isInitialized) {
        console.warn('Token Service not initialized. Initializing now...');
        await this.initialize(); // Ensure initialization completes
    }

    if (this.next_value === null || this.range_end === null) {
        console.error('Range not available. Attempting to lease...');
        await this.leaseNewRange();
        if (this.next_value === null) { // Still null after attempt?
             throw new Error('Failed to obtain a token range.');
        }
    }

    // --- Fast Path --- 
    const currentValue = this.next_value;
    if (currentValue <= this.range_end) {
        this.next_value++; // Increment atomically (in-memory)

        // Check for pre-fetching
        const rangeSize = this.range_end - this.range_start + BigInt(1);
        const consumed = currentValue - this.range_start + BigInt(1);
        if (!this.isLeasing && consumed >= rangeSize * BigInt(Math.floor(PREFETCH_THRESHOLD_PERCENT * 100)) / BigInt(100)) {
            console.log(`Approaching range end (${consumed}/${rangeSize}). Pre-fetching next range...`);
            this.leaseNewRange().catch(err => {
                // Log pre-fetch error but don't block current request
                console.error('Error during pre-fetch:', err.message);
            });
        }

        // Persist the incremented next_value to Redis asynchronously
        persistRangeState(this.instanceId, {
            range_start: this.range_start.toString(),
            range_end: this.range_end.toString(),
            next_value: this.next_value.toString(), // Persist the *next* value
        }).catch(err => console.error('Redis persistence error (async):', err));

        return encodeBase62Fixed(Number(currentValue)); // Encode the *current* value
    }

    // --- Slow Path (Slice Exhausted) ---
    console.log('Current range exhausted. Requesting new range synchronously...');
    try {
        await this.leaseNewRange(); // Wait for the new lease
        // After getting a new range, retry getting the slug
        return await this.getSlug();
    } catch (error) {
        console.error('Failed to get slug after exhausting range:', error);
        throw new Error('Failed to generate slug after range exhaustion.');
    }
  }
}

// Singleton instance
const tokenService = new TokenService();

module.exports = tokenService;