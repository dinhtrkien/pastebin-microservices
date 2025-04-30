const axios = require("axios");
const pasteRepo = require("./pasteRepo");

const cacheService = require("./redis/cacheService");

// Read service URLs from environment variables
const SLUG_GENERATOR_URL =
  process.env.SLUG_GENERATOR_URL || "http://localhost:3001";
const ANALYTICS_SERVICE_URL =
  process.env.ANALYTICS_SERVICE_URL || "http://localhost:3002";

const CACHE_TTL = parseInt(process.env.REDIS_TTL, 10) || 3600;

/**
 * Service for paste-related logic
 */
const pasteService = {
  /**
   * Create a new paste
   * @param {string} content - Content of the paste
   * @param {Date|null} expirationTime - When the paste expires (null for never)
   * @returns {Promise<Object>} Created paste object
   */
  async createPaste(content, expirationTime) {
    try {
      // Request a new slug from slug generator service
      const slugResponse = await axios.get(`${SLUG_GENERATOR_URL}/slug`);
      const slug = slugResponse.data.slug;

      // Create paste in the database
      const paste = await pasteRepo.createPaste(slug, content, expirationTime);

      // Cache new pastes with a shorter TTL (5 minutes)
      // Only frequently accessed pastes will stay in cache longer
      // const INITIAL_CACHE_TTL = 300; // 5 minutes for new pastes
      // await cacheService.set(slug, paste, INITIAL_CACHE_TTL);

      // // Confirm slug usage to extend cache
      // try {
      //   await axios.post(`${SLUG_GENERATOR_URL}/api/slugs/${slug}/confirm`);
      // } catch (slugError) {
      //   console.warn("Failed to confirm slug usage:", slugError.message);
      // }

      return paste;
    } catch (error) {
      console.error("Error creating paste:", error);
      throw new Error("Failed to create paste");
    }
  },
  /**
   * Helper method to increment paste views when served from cache
   * Runs asynchronously (fire and forget)
   * @param {string} slug - Paste slug
   * @param {Object} cachedPaste - The cached paste object
   * @returns {Promise<void>}
   * @private
   */
  // async _incrementPasteViews(slug, cachedPaste) {
  //   try {
  //     // 1. Increment in the database
  //     await pasteRepo.incrementViews(slug);

  //     // 2. Update the cached object's view count
  //     // Create a new object to avoid modifying the one potentially still in use
  //     const updatedCachedPaste = {
  //       ...cachedPaste,
  //       viewsCount: cachedPaste.viewsCount + 1,
  //     };

  //     // 3. Update the cache with the new view count and reset TTL
  //     await cacheService.set(slug, updatedCachedPaste, CACHE_TTL);

  //     // 4. Notify analytics service
  //     axios
  //       .post(`${ANALYTICS_SERVICE_URL}/api/analytics/increment`, {
  //         pasteId: cachedPaste.id, // Use ID from cached object
  //         dateBucket: new Date(),
  //       })
  //       .catch((err) => {
  //         console.warn(
  //           `Failed to update analytics (from cache) for ${slug}:`,
  //           err.message
  //         );
  //       });
  //   } catch (error) {
  //     // Log errors during the background update process
  //     console.error(
  //       `Error during background view increment for ${slug}:`,
  //       error
  //     );
  //     // Optionally, try to invalidate cache if DB update failed?
  //     // await cacheService.delete(slug);
  //   }
  // },

  /**
   * Get a paste by its slug
   * @param {string} slug - The paste's unique slug
   * @returns {Promise<Object|null>} The paste or null if not found/expired
   */
  async getPaste(slug) {
    try {
      // Try to get paste from cache first
      const cachedPaste = await cacheService.get(slug);

      if (cachedPaste) {
        // Check if cached paste is expired
        if (pasteRepo.isPasteExpired(cachedPaste)) {
          await cacheService.delete(slug);
          return null;
        }

        // await pasteRepo.incrementViews(slug);

        // Increment views in background (fire and forget)
        // this._incrementPasteViews(slug, cachedPaste).catch((err) => {
        //   console.error(`Failed to increment views for ${slug}:`, err);
        // });

        return cachedPaste;
      }

      // If not in cache, get from database
      const paste = await pasteRepo.findPasteBySlug(slug);
      if (!paste) return null;

      // Check if paste is expired
      if (pasteRepo.isPasteExpired(paste)) {
        return null;
      }

      // this._incrementPasteViews(slug, cachedPaste).catch((err) => {
      //   console.error(`Failed to increment views for ${slug}:`, err);
      // });

      // Increment views
      // await pasteRepo.incrementViews(slug);

      // Local copy modification for immediate view update
      // paste.viewsCount += 1;

      // update cache
      await cacheService.set(slug, paste, CACHE_TTL);

      // Notify analytics service (fire and forget)
      // try {
      //   await axios
      //     .post(`${ANALYTICS_SERVICE_URL}/api/analytics/increment`, {
      //       pasteId: paste.id,
      //       dateBucket: new Date(),
      //     })
      //     .catch((err) => {
      //       // Log but don't fail request if analytics service is unavailable
      //       console.warn("Failed to update analytics:", err.message);
      //     });
      // } catch (analyticsError) {
      //   // Log analytics errors but don't fail the main request
      //   console.warn("Analytics service error:", analyticsError.message);
      // }

      return paste;
    } catch (error) {
      console.error(`Error retrieving paste ${slug}:`, error);
      throw new Error("Failed to retrieve paste");
    }
  },
};

module.exports = pasteService;
