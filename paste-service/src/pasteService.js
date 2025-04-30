const axios = require("axios");
const pasteRepo = require("./pasteRepo");

const cacheService = require("./redis/cacheService");

const isCacheEnabled = process.env.ENABLE_REDIS_CACHE === "true";

const SLUG_GENERATOR_URL =
  process.env.SLUG_GENERATOR_URL || "http://localhost:3001";
const ANALYTICS_SERVICE_URL =
  process.env.ANALYTICS_SERVICE_URL || "http://localhost:3002";

const CACHE_TTL = parseInt(process.env.REDIS_TTL, 10) || 3600;

const pasteService = {
  async createPaste(content, expirationTime) {
    try {
      // Request a new slug from slug generator service
      const slugResponse = await axios.post(
        `${SLUG_GENERATOR_URL}/api/slugs/generate`
      );
      const slug = slugResponse.data.slug;

      // Create paste in the database
      const paste = await pasteRepo.createPaste(slug, content, expirationTime);

      // Cache new pastes only if caching is enabled
      // if (isCacheEnabled) {
      //   const INITIAL_CACHE_TTL = 300; // 5 minutes for new pastes
      //   cacheService.set(slug, paste, INITIAL_CACHE_TTL);
      // }

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

  // async getPaste(slug) {
  //   try {
  //     // Try to get paste from cache first
  //     const cachedPaste = await cacheService.get(slug);

  //     if (cachedPaste) {
  //       // Check if cached paste is expired
  //       if (pasteRepo.isPasteExpired(cachedPaste)) {
  //         await cacheService.delete(slug);
  //         return null;
  //       }

  //       // await pasteRepo.incrementViews(slug);

  //       // Increment views in background (fire and forget)
  //       this._incrementPasteViews(slug, cachedPaste).catch((err) => {
  //         console.error(`Failed to increment views for ${slug}:`, err);
  //       });

  //       return cachedPaste;
  //     }

  //     // If not in cache, get from database
  //     const paste = await pasteRepo.findPasteBySlug(slug);
  //     if (!paste) return null;

  //     // Check if paste is expired
  //     if (pasteRepo.isPasteExpired(paste)) {
  //       return null;
  //     }

  //     // this._incrementPasteViews(slug, cachedPaste).catch((err) => {
  //     //   console.error(`Failed to increment views for ${slug}:`, err);
  //     // });

  //     // Increment views
  //     await pasteRepo.incrementViews(slug);

  //     // Local copy modification for immediate view update
  //     // paste.viewsCount += 1;

  //     // update cache
  //     await cacheService.set(slug, paste, CACHE_TTL);

  //     // Notify analytics service (fire and forget)
  //     try {
  //       await axios
  //         .post(`${ANALYTICS_SERVICE_URL}/api/analytics/increment`, {
  //           pasteId: paste.id,
  //           dateBucket: new Date(),
  //         })
  //         .catch((err) => {
  //           // Log but don't fail request if analytics service is unavailable
  //           console.warn("Failed to update analytics:", err.message);
  //         });
  //     } catch (analyticsError) {
  //       // Log analytics errors but don't fail the main request
  //       console.warn("Analytics service error:", analyticsError.message);
  //     }

  //     return paste;
  //   } catch (error) {
  //     console.error(`Error retrieving paste ${slug}:`, error);
  //     throw new Error("Failed to retrieve paste");
  //   }
  // },

  async getPasteWithoutIncrement(slug) {
    try {
      let cachedPaste = null;
      // Try to get paste from cache first if enabled
      if (isCacheEnabled) {
        cachedPaste = await cacheService.get(slug);
      }

      if (cachedPaste) {
        // Check if cached paste is expired
        if (pasteRepo.isPasteExpired(cachedPaste)) {
          if (isCacheEnabled) {
            await cacheService.delete(slug);
          }
          return null;
        }
        return cachedPaste;
      }

      // If not in cache, get from database
      const paste = await pasteRepo.findPasteBySlug(slug);
      if (!paste) return null;

      // Check if paste is expired
      if (pasteRepo.isPasteExpired(paste)) {
        return null;
      }

      // Cache the paste for future requests
      await cacheService.set(slug, paste, CACHE_TTL);

      return paste;
    } catch (error) {
      console.error(`Error retrieving paste ${slug}:`, error);
      throw new Error("Failed to retrieve paste");
    }
  },
};

module.exports = pasteService;
