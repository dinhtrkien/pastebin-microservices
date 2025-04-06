// Service for Paste domain
const pasteRepo = require("./pasteRepo.js");
const slugGeneratorService =
  require("../slugGenerator/slugGeneratorService.js")(pasteRepo);
const cacheService = require("../cache/cacheService.js");
const analyticsService = require("../analytics/AnalyticsService.js");

// // Generate a short random slug (6 chars)
// function generateSlug() {
//   return Math.random().toString(36).substr(2, 6);
// }

const CACHE_TTL = parseInt(process.env.REDIS_TTL, 10) || 3600;

module.exports = {
  async createPaste(content, expirationTime) {
    const slug = await slugGeneratorService.generateUniqueSlug();
    const paste = await pasteRepo.createPaste(slug, content, expirationTime);
    paste.viewsCount = 1; // Initialize view count
    // Cache the newly created paste
    await cacheService.set(slug, paste, CACHE_TTL);

    return paste;
  },

  async getPaste(slug) {
    // Try to get paste from cache first
    const cachedPaste = await cacheService.get(slug);

    if (cachedPaste) {
      // Check if cached paste is expired
      if (
        cachedPaste.expirationTime &&
        new Date() > new Date(cachedPaste.expirationTime)
      ) {
        // Delete from cache and return null
        await cacheService.delete(slug);
        return null;
      }

      analyticsService
        .incrementViews(new Date(), cachedPaste.id)
        .catch((err) => {
          console.error(`Failed to increment views for ${slug}:`, err);
        });

      // Update view count in database but don't wait for it (fire and forget)
      this._incrementPasteViews(slug, cachedPaste).catch((err) => {
        console.error(`Failed to increment views for ${slug}:`, err);
      });

      return cachedPaste;
    }

    // If not in cache, get from database
    const paste = await pasteRepo.findPasteBySlug(slug);
    if (!paste) return null;

    // Check if paste is expired
    if (paste.expirationTime && new Date() > new Date(paste.expirationTime)) {
      return null;
    }

    // Check if paste is expired (maybe dont delete it, just mark as expired)
    // Implement a cron job to delete expired pastes periodically (Done in cleanupService.js)
    if (paste.expirationTime && new Date() > new Date(paste.expirationTime)) {
      // await pasteRepo.deletePaste(slug); // bad practice
      return null;
    }

    // Increment views
    await pasteRepo.incrementViews(slug);
    analyticsService.incrementViews(new Date(), paste.id);
    paste.viewsCount += 1; // update local copy

    // Cache the paste for future requests
    await cacheService.set(slug, paste, CACHE_TTL);

    return paste;
  },

  /**
   * Helper method to increment paste views and update cache
   * @param {string} slug - Paste slug
   * @param {Object} cachedPaste - The cached paste object
   * @returns {Promise<void>}
   * @private
   */
  async _incrementPasteViews(slug, cachedPaste) {
    // Update the database
    await pasteRepo.incrementViews(slug);

    // Update the cached object's view count
    cachedPaste.viewsCount += 1;

    // Update the cache with new view count
    await cacheService.set(slug, cachedPaste, CACHE_TTL);
  },
};
