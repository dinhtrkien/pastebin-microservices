const { createCacheService } = require('./redis/cacheService');
const cacheService = createCacheService('slugs');

// Create a function to generate a random slug
function generateRandomSlug(length = 6) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return slug;
}

// Create SlugGeneratorService
const slugGeneratorService = {
  // Generate a unique slug that isn't already in use
  async generateUniqueSlug() {
    let slug = generateRandomSlug();
    let attempts = 0;
    const maxAttempts = 10;

    // Check if slug exists in cache first (faster than DB check)
    while (!(await cacheService.isSlugAvailable(slug)) && attempts < maxAttempts) {
      slug = generateRandomSlug();
      attempts++;
    }

    // Reserve the slug in cache to prevent duplication during DB operations
    // Short TTL since this is just to prevent race conditions during creation
    await cacheService.set(slug, { reserved: true }, 60); // 60 seconds reservation
    
    return slug;
  },

  // Release a slug reservation if the paste creation fails
  async releaseSlug(slug) {
    await cacheService.delete(slug);
  },

  // Called after DB confirmation to extend the cache time
  async confirmSlugUsed(slug) {
    await cacheService.set(slug, { used: true }, 3600 * 24); // Cache for 24 hours
  }
};

module.exports = slugGeneratorService;