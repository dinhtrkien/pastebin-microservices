const cron = require('node-cron');
const prismaClient = require('../../../prisma/prismaClient.js');
const cacheService = require('../cache/cacheService.js');

// Constants
const BATCH_SIZE = 1000;
const BATCH_DELAY_MS = 1000;

/**
 * Service that handles automated cleanup of expired pastes
 */
class CleanupService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Initialize the cleanup scheduler
   */
  initialize() {
    // Schedule cleanup job to run at midnight (0 0 * * *)
    cron.schedule('0 0 * * *', () => {
      this.cleanupExpiredPastes();
    });
    
    console.log('Cleanup service initialized - scheduled to run daily at midnight');
  }

  /**
   * Run cleanup process immediately
   */
  async runNow() {
    return this.cleanupExpiredPastes();
  }

  /**
   * Pause execution for the specified duration
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Resolves after the delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Delete all expired pastes from the database in batches
   */
  async cleanupExpiredPastes() {
    if (this.isRunning) {
      console.log('Cleanup already in progress, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('Starting cleanup of expired pastes...');

      const now = new Date();
      let totalDeleted = 0;
      let batchCount = 0;
      let hasMore = true;

      while (hasMore) {
        batchCount++;
        
        // Find batch of expired pastes to delete
        const expiredPastes = await prismaClient.paste.findMany({
          where: {
            expirationTime: {
              lt: now,
              not: null
            }
          },
          select: { id: true, slug: true },
          take: BATCH_SIZE
        });

        if (expiredPastes.length === 0) {
          hasMore = false;
          continue;
        }

        // Extract IDs for deletion
        const pasteIds = expiredPastes.map(paste => paste.id);
        
        // Delete analytics data for expired pastes first
        await prismaClient.analytics.deleteMany({
          where: {
            pasteId: { in: pasteIds }
          }
        });

        // Clear cache entries for expired pastes
        for (const paste of expiredPastes) {
          await cacheService.delete(paste.slug);
        }
        
        // Delete the batch of pastes
        const deleteResult = await prismaClient.paste.deleteMany({
          where: {
            id: { in: pasteIds }
          }
        });

        totalDeleted += deleteResult.count;
        console.log(`Batch ${batchCount}: Deleted ${deleteResult.count} expired pastes and their analytics data`);
        
        // If we got fewer results than the batch size, we're done
        if (expiredPastes.length < BATCH_SIZE) {
          hasMore = false;
        } else {
          // Add a small delay between batches to reduce database load
          await this.delay(BATCH_DELAY_MS);
        }
      }

      console.log(`Cleanup completed: ${totalDeleted} expired pastes and their analytics deleted in ${batchCount} batches`);
      return totalDeleted;
    } catch (error) {
      console.error('Error during paste cleanup:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}

// Create and export a singleton instance
const cleanupService = new CleanupService();
module.exports = cleanupService;