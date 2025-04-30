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
      const slugResponse = await axios.get(`${SLUG_GENERATOR_URL}/slug`);
      const slug = slugResponse.data.slug;

      // Create paste in the database
      const paste = await pasteRepo.createPaste(slug, content, expirationTime);

      return paste;
    } catch (error) {
      console.error("Error creating paste:", error);
      throw new Error("Failed to create paste");
    }
  },

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
